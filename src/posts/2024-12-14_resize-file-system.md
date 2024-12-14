---
title: "Resizing a File System using fdisk"
date: '2024-12-14'
tags: [ linux ]
draft: true
---

Let's write down how to resize a partition using `fdisk`!

<!-- more -->

## Shrinking a Partition

First let's check the current state of our system using `lsblk`. For simplicity, I only included the columns we are
interested in.

```shell
❯ lsblk --output name,fstype,uuid,partlabel,size /dev/nvme0n1
NAME        FSTYPE UUID                                 PARTLABEL   SIZE
nvme0n1                                                           931.5G
├─nvme0n1p1 vfat   71AA-7301                            primary       4M
├─nvme0n1p2 ext4   6f4ee3e8-bd73-4954-a58b-5de28fc5bea8 primary   931.5G
```

### Resizing the File System

Now try to resize the partition to the size we want it to using `resize2fs`.

```shell
❯ sudo resize2fs /dev/nvme0n1p2 128G
resize2fs 1.47.1 (20-May-2024)
Please run 'e2fsck -f /dev/nvme0n1p2' first.
```

It tells us to run `e2fsck` first, let's do that then.

```shell
❯ sudo e2fsck -f /dev/nvme0n1p2
e2fsck 1.47.1 (20-May-2024)
Pass 1: Checking inodes, blocks, and sizes
Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information
cloudimg-rootfs: 88385/61046784 files (0.1% non-contiguous), 4856771/244185344 blocks
```

We can now re-run `resize2fs`.

```shell
❯ sudo resize2fs /dev/nvme0n1p2 128G
resize2fs 1.47.1 (20-May-2024)
Resizing the filesystem on /dev/nvme0n1p2 to 33554432 (4k) blocks.
The filesystem on /dev/nvme0n1p2 is now 33554432 (4k) blocks long.
```

Write down the two values of 33554432 and 4k.

### Resizing the Partition

The file system now has a size of 128G, but the partition is not.

We will have to use `fdisk` and start editing the partitions, this part will look a bit scary since we will be deleting
partitions and recreating them.

```shell
❯ sudo fdisk /dev/nvme0n1
Welcome to fdisk (util-linux 2.40.2).
Changes will remain in memory only, until you decide to write them.
Be carefu before using the write command.


Command (m for help): p
Disk /dev/nvme0n1: 931.51 GiB, 1000204886016 bytes, 1953525168 sectors
Disk model: CT1000P3SSD8
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/ptimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 501DC2B7-5EF2-40CD-8B90-DF1704319DBA

Device         Start        End    Sectors   Size Type
/dev/nvme0n1p1 32768      40959       8192     4M Microsoft basic data
/dev/nvme0n1p2 40960 1953523711 1953482752 931.5G EFI System

Command (m for help): d
Partition number (1,2, default 2): 2

Partition 2 has been deleted.

Command (m for help): n
Partition number (2-128, default 2): 2
First sector (34-1953525134, default 40960): 40960
Last sector, +/-sectors or +/-size{K,M,G,T,P} (40960-1953525134, default 1953523711): +134217728K

Created a new partition 2 of type 'Linux filesystem' and of size 128 GiB.
Partition #2 contains a ext4 signature.

Do you want to remove the signature? [Y]es/[N]o: n
```

With that, we recreated the partition with the same start sector, the default value may not be the same, make sure to reuse the exact same one! If done right, `fdisk` asks us if we want to clear the signature, make sure to keep it as we don't want to wipe the file system.

For the size, we reuse the previous two values given by `resize2fs`, multiply those together: `33554432 * 4k = 134217728k`

If we leave it as is now, the system won't be able to boot, since the configuration in our `fstab` uses the UUID or labels of the partition to boot. We next have to set the UUID and label back. For that, we have to enter the expert mode.

```shell
Command (m for help): x

Expert command (m for help): n
Partition number (1,2, default 2): 2

New name: primary

Partition name changed from '' to 'primary'.

Exper command (m for help): u
Partition number (1,2, default 2): 2

New UUID (in 8-4-4-4-12 format): 6f4ee3e8-bd73-4954-a58b-5de2fc5bea88

Partition UUID changed from C77847D5-D1C3-48FB-8AC6-BF5CBB0E0FFE to 6F4EE3E8-BD73-4954-A58B-5DE28FC5BEA8.
Expert command (m for help): r
```

### Adding a new Partition

The goal of shrinking a partition is to add a new partition next to it on the same device. We can do this using `fdisk` as well! This time we can use all the default values, it will use the rest of the disk.

```shell
Command (m for help): n
Partition number (3-128, default 3):
First sector (34-1953525134, default 268476416):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (268476416-1953525134, default 1953523711):

Created a new partition 3 of type 'Linux filesystem' and of size 803.5 GiB.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

Finally, let's check using the same first command the state of our disk.
```shell
❯ lsblk --output name,fstype,uuid,partlabel,size /dev/nvme0n1
NAME        FSTYPE UUID                                 PARTLABEL   SIZE
nvme0n1                                                           931.5G
├─nvme0n1p1 vfat   71AA-7301                            primary       4M
├─nvme0n1p2 ext4   6f4ee3e8-bd73-4954-a58b-5de28fc5bea8 primary     128G
└─nvme0n1p3                                                       803.5G
```

We can see that we have the same partition 2 but with a different size along side a new partition!
Now we reboot and it should boot correctly!
