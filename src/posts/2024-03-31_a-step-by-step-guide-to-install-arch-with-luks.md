---
title: A step-by-step guide to install Arch with LUKS
date: '2024-03-31'
draft: false
tags: [linux]
oldUrl: /linux/2024/03/31/a-step-by-step-guide-to-install-arch-with-luks
---
After using [Silverblue](https://quozul.dev/linux/2023/12/07/using-an-immuable-desktop) for six months, the package manager was starting to get really slow, so I decided to switch distro, Arch was my choice.
The goal was to install Arch Linux with Full Disk Encryption and EFI boot. Here's how I did it.

<!--more-->

## Partitioning the disk

I took inspiration from the [dm-crypt/Encrypting an entire system#LUKS on a partition with TPM2 and Secure Boot](https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system#LUKS_on_a_partition_with_TPM2_and_Secure_Boot){target="_blank"} guide from the Arch Wiki while taking more of a step-by-step approach.

Before partitioning the disks, you can follow the [Installation guide](https://wiki.archlinux.org/title/Installation_guide){target="_blank"} up to step [Installation guide#Partition the disks](https://wiki.archlinux.org/title/Installation_guide#Partition_the_disks){target="_blank"} to set up keyboard layout and whatnot. The only thing I used from those extra steps is the command `loadkeys fr` since I'm using an AZERTY keyboard layout but you may find something useful, like WI-FI or internet setup.

First, we need to check the disk we want to be using for our Arch install. We can do this using the `lsblk`. In my case, I'll be using the disk `/dev/sda` since I'm redoing it in a virtual machine for this guide.

```bash
root@archiso ~ # lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda      8:0    0    20G  0 disk
```

Then open `fdisk` and start the partitioning.
Since fdisk is quite hard to use, I'll write a step-by-step guide.

1. Create a GPT partition table for UEFI support
    ```bash
    Command (m for help): g
    Created a new GPT disklabel (GUID: 44529CC9-3C91-4655-8393-2DB938617FAA).
    ```

2. Create the boot partition with a size of 512 MB
    ```bash
    Command (m for help): n
    Partition number (1-128, default 1):
    First sector (2048-41943006, default 2048):
    Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-41943006, default 41940991): +512M
    
    Created a new partition 1 of type 'Linux filesystem' and of size 512 MiB.
    ```

3. Label the new partition as 'EFI System'
    ```bash
    Command (m for help): t
    Selected partition 1
    Partition type or alias (type L to list all): 1
    Changed type of partition 'Linux filesystem' to 'EFI System'.
    ```

4. Create the root partition with the rest of the disk
    ```bash
    Command (m for help): n
    Partition number (2-128, default 2):
    First sector (1050624-41943006, default 1050624):
    Last sector, +/-sectors or +/-size{K,M,G,T,P} (1050624-41943006, default 41940991):
    
    Created a new partition 2 of type 'Linux filesystem' and of size 19.5 GiB.
    ```

5. Label the new partition as 'Linux root (x86-64)', do not split this partition, we'll completely encrypt it later on.
    ```bash
    Command (m for help): t
    Partition number (1,2, default 2): 2
    Partition type or alias (type L to list all): 23
    
    Changed type of partition 'Linux filesystem' to 'Linux root (x86-64)'.
    ```

6. Write the changes to disk
    ```bash
    Command (m for help): w
    The partition table has been altered.
    Calling ioctl() to re-read partition table.
    Syncing disks.
    ```

Now it should look like this:

```bash
root@archiso ~ # lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda      8:0    0    20G  0 disk
├─sda1   8:1    0   512M  0 part
└─sda2   8:2    0  19.5G  0 part
```

## Create the file systems

Let's start with the main partition.

1. Create the LUKS volume, note that the passphrase will not echo, I have written '*' for demonstration
    ```bash
    root@archiso ~ # cryptsetup luksFormat /dev/sda2
    
    WARNING!
    ========
    This will overwrite data on /dev/sda2 irrevocably.
    
    Are you sure? (Type 'yes' in capital letters): YES
    Enter passphrase for /dev/sda2:
    Verify passphrase: ********
    ```

2. Open the new LUKS volume, it will map to `/dev/mapper/root`
    ```bash
    root@archiso ~ # cryptsetup open /dev/sda2 root
    Enter passphrase for /dev/sda2: ********
    ```
   
3. Now we can create the file system and mount it, this step is up to you, but I decided to go with a single ext4 partition for simplicity
    ```bash
    root@archiso ~ # mkfs.ext4 /dev/mapper/root
    mke2fs 1.47.0 (5-Feb-2023)
    Creating filesystem with 5107200 4k blocks and 1277952 inodes
    Filesystem UUID: 6b533fb9-c082-46b1-b198-0ddf2c78a6d4
    Superblock backups stored on blocks:
    32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208,
    4096000
    
    Allocating group tables: done
    Writing inode tables: done
    Creating journal (32768 blocks): done
    Writing superblocks and filesystem accounting information: done
    
    root@archiso ~ # mount /dev/mapper/root /mnt
    ```

4. Now let's create the file system for the EFI partition and mount it:
    ```bash
    root@archiso ~ # mkfs.fat -F32 /dev/sda1
    mkfs.fat 4.2 (2021-01-31)
    root@archiso ~ # mount --mkdir /dev/sda1 /mnt/efi
    ```

We should end up with something like this, you can check the filesystems with the `--fs` option:
```bash
root@archiso ~ # lsblk --fs
NAME     FSTYPE      FSVER FSAVAIL FSUSE% MOUNTPOINTS
sda
├─sda1   vfat        FAT32    511M     0% /mnt/efi
└─sda2   crypto_LUKS 2    
  └─root ext4        1.0       18G     0% /mnt
```

## Installing the system

Now the fun part, actually installing Arch!

1. Install essential packages
    ```bash
    root@archiso ~ # pacstrap -K /mnt base linux linux-firmware
    ==> Creating install root at /mnt
    # Whatever this command is doing...
    ```
   I recommend installing `vim` or `nano` using Pacman `pacman -S vim` for the next steps as they require editing some files, any installed packages will end up in your final system.

2. We can skip the `fstab` setup from the official guide, and jump to the [Chroot](https://wiki.archlinux.org/title/Installation_guide#Chroot){target="_blank"}, [Time](https://wiki.archlinux.org/title/Installation_guide#Time){target="_blank"}, [Localization](https://wiki.archlinux.org/title/Installation_guide#Localization){target="_blank"} and [Network configuration](https://wiki.archlinux.org/title/Installation_guide#Network_configuration){target="_blank"} steps from the Arch's [Installation guide](https://wiki.archlinux.org/title/Installation_guide){target="_blank"} but stop at the Initramfs step which we'll do later.

3. Next we'll install the bootloader
    ```bash
    bootctl install
    ```

4. Modify the `HOOKS=` line in `mkinitcpio.conf` as follows:
    ```
    HOOKS=(base systemd autodetect microcode modconf kms keyboard sd-vconsole block sd-encrypt filesystems fsck)
    ```

5. Update `/etc/mkinitcpio.d/linux.preset` as follows to enable EFI image:
    ```bash
    # mkinitcpio preset file for the 'linux' package
    
    #ALL_config="/etc/mkinitcpio.conf"
    ALL_kver="/boot/vmlinuz-linux"
    
    PRESETS=('default' 'fallback')
    
    #default_config="/etc/mkinitcpio.conf"
    #default_image="/boot/initramfs-linux.img"
    default_uki="/efi/EFI/Linux/arch-linux.efi"
    default_options="--splash=/usr/share/systemd/bootctl/splash-arch.bmp"
    
    #fallback_config="/etc/mkinitcpio.conf"
    #fallback_image="/boot/initramfs-linux-fallback.img"
    fallback_uki="/efi/EFI/Linux/arch-linux-fallback.efi"
    fallback_options="-S autodetect"
    ```

6. Generating the initramfs
    ```bash
    mkinitcpio -P
    ```
   
7. Remember to set a password for the root user `passwd root`
8. [Safely reboot](https://wiki.archlinux.org/title/Installation_guide#Reboot){target="_blank"}, unplug the USB thumb drive, and it should all work!

## Installing a desktop environment

Let's create a user, so we don't have to use root for everything:

```bash
# create a user with its home directory
useradd -m user
# set a password for user
passwd user
```

To install Gnome, it is just two commands:

```bash
pacman -S gnome
systemctl enable --now gdm
```

## Improvements

I'll probably try a more unique file system setup, such as BTRFS or ZFS on a LVM RAID.
I'll try encrypting the EFI partition as well with automatic decryption of the drive using secure boot and TPM2 but with home encryption using systemd-homed.

## Resources

- [dm-crypt/Encrypting an entire system](https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system){target="_blank"}
- [Installation guide](https://wiki.archlinux.org/title/Installation_guide){target="_blank"}
- [mkinitcpio v31 and UEFI stubs](https://linderud.dev/blog/mkinitcpio-v31-and-uefi-stubs/){target="_blank"} (outdated, see below)
- [Unified kernel image#.preset file](https://wiki.archlinux.org/title/Unified_kernel_image#.preset_file){target="_blank"}
