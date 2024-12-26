#!/bin/bash

# Usage:
# curl -sSL https://quozul.dev/uploads/configure-readonly.sh | sudo bash -s -- /dev/nvme0n1p1
# Replace /dev/nvme0n1p1 with your own device! The partition must be already existing.

set -x
# Exit immediately if a command exits with a non-zero status
set -e

# Check for root privileges
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script with sudo or as root."
  exit 1
fi

# Usage message
if [ $# -gt 1 ]; then
  echo "Usage: $0 [device]"
  echo "Example: $0 /dev/nvme0n1p1"
  exit 1
fi

DEVICE="$1"

# Backup /etc/kernel/cmdline
if [ ! -f /etc/kernel/cmdline.bak ]; then
  cp /etc/kernel/cmdline /etc/kernel/cmdline.bak
fi

# Modify /etc/kernel/cmdline: replace 'rw' with 'ro'
if ! grep -q '\bro\b' /etc/kernel/cmdline; then
  sed -i 's/\brw\b/ro/g' /etc/kernel/cmdline
  u-boot-update
fi

# Get the root device, UUID, and filesystem type
ROOT_DEV=$(findmnt -n -o SOURCE /)
ROOT_UUID=$(blkid -s UUID -o value "$ROOT_DEV")
ROOT_FS_TYPE=$(findmnt -n -o FSTYPE /)

# Validate that we have the necessary information
if [ -z "$ROOT_UUID" ] || [ -z "$ROOT_FS_TYPE" ]; then
  echo "Failed to retrieve root filesystem information."
  exit 1
fi

# Backup /etc/fstab
if [ ! -f /etc/fstab.bak ]; then
  cp /etc/fstab /etc/fstab.bak
fi

# Remove existing root and /var/lib entries in /etc/fstab
grep -vE "^[^#].*\s+(/|\s+/var/lib\s+)" /etc/fstab > /etc/fstab.new

# Add the new root entry with 'ro' option
echo "UUID=$ROOT_UUID  /  $ROOT_FS_TYPE  defaults,ro  0  1" >> /etc/fstab.new

# Append tmpfs entries to /etc/fstab
cat <<EOF >> /etc/fstab.new
tmpfs   /tmp        tmpfs   nosuid,nodev        0       0
tmpfs   /run        tmpfs   nosuid,noexec       0       0
tmpfs   /var/log    tmpfs   nosuid,nodev        0       0
tmpfs   /var/tmp    tmpfs   nosuid,nodev        0       0
EOF

if [ -n "$DEVICE" ]; then
  # Ensure the device exists
  if [ ! -b "$DEVICE" ]; then
    echo "Device $DEVICE does not exist."
    exit 1
  fi

  # Create filesystem on the device (Ext4)
  echo "Formatting $DEVICE with ext4 filesystem..."
  mkfs.ext4 -F "$DEVICE"

  # Get UUID of the device
  DEVICE_UUID=$(blkid -s UUID -o value "$DEVICE")

  # Mount the device temporarily
  mkdir -p /mnt/temp_device
  mount "$DEVICE" /mnt/temp_device

  # Copy existing /var/lib content to the device
  echo "Copying /var/lib contents to $DEVICE..."
  rsync -a /var/lib/ /mnt/temp_device/

  # Unmount the device
  umount /mnt/temp_device
  rm -rf /mnt/temp_device

  # Add entry to /etc/fstab
  echo "UUID=$DEVICE_UUID  /var/lib  ext4  defaults  0  1" >> /etc/fstab.new
fi

# Replace the old /etc/fstab with the new one
mv /etc/fstab.new /etc/fstab

# Add aliases to /etc/bash.bashrc if not already present
if ! grep -q "alias ro='mount -o remount,ro /'" /etc/bash.bashrc; then
  echo "alias ro='sudo mount -o remount,ro /'" >> /etc/bash.bashrc
  echo "alias rw='sudo mount -o remount,rw /'" >> /etc/bash.bashrc
fi

echo "Configuration complete. Your system has been set to boot in read-only mode."

if [ -n "$DEVICE" ]; then
  echo "/var/lib will be mounted on $DEVICE."
  echo "Docker and other services using /var/lib will store data on this device."
fi

echo "Please reboot your system for the changes to take effect."
