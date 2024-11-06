---
title: "Building my own image for the Turing RK1 (part 3: Buildroot)"
date: '2024-10-14'
tags: [linux, arm]
draft: true
---

<!-- more -->

```shell
❯ sudo fdisk /dev/sdc

Welcome to fdisk (util-linux 2.40.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): p
Disk /dev/sdc: 931,51 GiB, 1000204886016 bytes, 1953525168 sectors
Disk model:
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 33553920 bytes
Disklabel type: gpt
Disk identifier: 2ED854A5-709E-468F-BB30-42E0A82A7FFD

Device     Start     End Sectors  Size Type
/dev/sdc1     34 1048609 1048576  512M EFI System

Command (m for help): d
Selected partition 1
Partition 1 has been deleted.

Command (m for help): n
Partition number (1-128, default 1):
First sector (34-1953525134, default 2048): 34
Last sector, +/-sectors or +/-size{K,M,G,T,P} (34-1953525134, default 1953523711):

Created a new partition 1 of type 'Linux filesystem' and of size 931,5 GiB.
Partition #1 contains a ext4 signature.

Do you want to remove the signature? [Y]es/[N]o: n

Command (m for help): t

Selected partition 1
Partition type or alias (type L to list all): 1
Changed type of partition 'Linux filesystem' to 'EFI System'.

Command (m for help): x

Expert command (m for help): n
Selected partition 1

New name: rootfs

Partition name changed from '' to 'rootfs'.

Expert command (m for help): r

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```



## Create a volume

```shell
❯ dd if=/dev/zero of=rootfs.img bs=1M count=512
❯ sudo losetup -f --show rootfs.img
```

## Create partitions

```shell
❯ sudo fdisk /dev/loop0

Welcome to fdisk (util-linux 2.40.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): o
Created a new DOS (MBR) disklabel with disk identifier 0x2b6cbc87.
The device contains 'gpt' signature and it will be removed by a write command. See fdisk(8) man page and --wipe option for more details.

Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (1-4, default 1):
First sector (2048-1048575, default 2048): 32768
Last sector, +/-sectors or +/-size{K,M,G,T,P} (32768-1048575, default 1048575):

Created a new partition 1 of type 'Linux' and of size 496 MiB.
Partition #1 contains a ext4 signature.

Do you want to remove the signature? [Y]es/[N]o: n

Command (m for help): a

Selected partition 1
The bootable flag on partition 1 is enabled now.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Re-reading the partition table failed.: Invalid argument

The kernel still uses the old table. The new table will be used at the next reboot or after you run partprobe(8) or partx(8).
```

### Refresh partition

Reload the partitions:
```shell
❯ sudo partprobe /dev/loop0
```

### Create our file system
```shell
❯ sudo mkfs.ext4 /dev/loop0p1
❯ sudo mount /dev/loop0p1 /mnt
❯ cd /mnt
❯ sudo tar -xf /path/to/rootfs.tar
❯ sudo umount /mnt
```

## Copy the bootloader
```shell
❯ cd /path/to/u-boot
❯ sudo dd if=./idbloader.img of=/dev/loop0 bs=512 seek=64 conv=notrunc
❯ sudo dd if=./u-boot.itb of=/dev/sdb bs=512 seek=16384 conv=notrunc
```

## Remove the volume

```shell
❯ sudo losetup -d /dev/loop0
```

### Resources

- [https://wiki.alpinelinux.org/wiki/Alpine_on_ARM](https://wiki.alpinelinux.org/wiki/Alpine_on_ARM)
- [https://github.com/CFSworks/alpine-rk1](https://github.com/CFSworks/alpine-rk1)

---

## Draft

Parition table: GPT
Parition type: "EFI System"
Start at: 32768
Label: "rootfs"
FS Type: ext2

```shell
sudo e2label /dev/loop0p1 rootfs
```

> !! This gives a LABEL, we want a PARTLABEL !! (enter expert mode in fdisk to rename the partition)
