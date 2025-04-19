---
title: "Encrypting a USB Drive using LUKS"
date: '2025-04-19'
tags: [ linux ]
---

In today's digital age, securing sensitive data is of utmost importance. One effective way to protect your data on a USB drive is by using Linux Unified Key Setup (LUKS) encryption. LUKS is a powerful and flexible encryption standard that ensures your data remains secure even if your USB drive falls into the wrong hands. In this guide, we'll walk you through the process of encrypting a USB drive using LUKS.

<!-- more -->

### Identify Your USB Drive
First, you need to identify the device name of your USB drive. You can do this using the `lsblk` command:
```shell
❯ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sdc           8:32   1 116,6G  0 disk
└─sdc1        8:33   1 116,6G  0 part
```
In this example, the USB drive is `/dev/sdc1`.

### Format the Device with LUKS
Next, you'll format the USB drive with LUKS using the `cryptsetup` tool. This process will overwrite all existing data on the drive, so ensure you have backed up any important information.
```shell
❯ sudo cryptsetup luksFormat /dev/sdc1
WARNING!
========
This will overwrite data on /dev/sdc1 irrevocably.

Are you sure? (Type 'yes' in capital letters): YES
Enter passphrase for /dev/sdc1:
Verify passphrase:
```
Enter a strong passphrase and verify it. This passphrase will be required to unlock the encrypted drive.

### Open the LUKS Device
After formatting, you need to open the LUKS device. You can name it anything you like; for this example, we'll name it `usbdrive`.
```shell
❯ sudo cryptsetup luksOpen /dev/sdc1 usbdrive
Enter passphrase for /dev/sdc1:
```
Enter the passphrase you set earlier to unlock the drive.

### Format the LUKS Device with a File System
Finally, format the LUKS device with a file system of your choice. In this example, we'll use EXT4.
```shell
❯ sudo mkfs.ext4 /dev/mapper/usbdrive
mke2fs 1.47.2 (1-Jan-2025)
Creating filesystem with 30552144 4k blocks and 7643136 inodes
Filesystem UUID: 7b542c90-4cf2-4d86-b6ef-6a5542109f9a
Superblock backups stored on blocks:
	32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208,
	4096000, 7962624, 11239424, 20480000, 23887872

Allocating group tables: done
Writing inode tables: done
Creating journal (131072 blocks): done
Writing superblocks and filesystem accounting information: done
```
Your USB drive is now encrypted and formatted with the EXT4 file system.

### Mount and Use Your Encrypted USB Drive
To use your encrypted USB drive, you need to mount it. Create a mount point and mount the drive:
```shell
❯ sudo mkdir /mnt/usbdrive
❯ sudo mount /dev/mapper/usbdrive /mnt/usbdrive
```

You can now copy files to and from the mounted drive. When you're done, unmount the drive and close the LUKS device:
```shell
❯ sudo umount /mnt/usbdrive
❯ sudo cryptsetup luksClose usbdrive
```

Note that if you prefer using a GUI rather than the CLI, a file explorer such as Nautilus on GNOME supports opening LUKS device.
