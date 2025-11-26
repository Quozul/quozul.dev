---
title: "Plausible Deniability using LUKS"
date: '2025-11-09'
tags: [ linux ]
draft: true
---

Okay, so I'm trying to set up plausible deniability on a Linux system using LUKS. This is for fun and experimentation—nothing shady, just playing with encryption and security.

<!--more-->

## Check the Device

First, I need to verify the device I'm working with.

```shell
❯ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sdc           8:32   1  28,7G  0 disk
└─sdc1        8:33   1  28,7G  0 part
```

Got it. `/dev/sdc` is my 32GB USB drive.

## Wipe the Device

Now, I need to securely erase the drive. This takes a while, but it's necessary.

```shell
❯ sudo dd if=/dev/urandom of=/dev/sdc bs=1M status=progress
30759976960 bytes (31 GB, 29 GiB) copied, 691 s, 44,5 MB/s
dd: error writing '/dev/sdc': No space left on device
29359+0 records in
29358+0 records out
30784094208 bytes (31 GB, 29 GiB) copied, 691,763 s, 44,5 MB/s
```

That took forever, about 11 minutes and a half for 32 GB. And now the USB drive is burning hot. Great.

---

## Partition the Drive

We'll be creating a single partition that uses the entire drive, we will create a filesystem of only 8 GiB to host the decoy data.
The partition size mismatching the filesystem size may raise suspicions. Do not use an unusual number like 5GB, that might look suspicious.

### Warning: Be Fucking Careful With This Part

I already fucked up and deleted my partition on a 4TB SSD. How to recover?

Luckily, I only removed the partition table, so no data was lost. The filesystem signature is still there, so I just need to rebuild the partition.

Anyways, let’s proceed with the actual USB drive partitioning.

### Partitioning the USB Drive

```shell
❯ sudo fdisk /dev/sdc

Welcome to fdisk (util-linux 2.41.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

This disk is currently in use - repartitioning is probably a bad idea.
It's recommended to umount all file systems, and swapoff all swap
partitions on this disk.
```

#### Create a GPT Partition Table (for UEFI support)

```shell
Command (m for help): g
Created a new GPT disklabel (GUID: CC7DE674-7D8A-452E-BAC2-45A40F9F136D).
```

#### Create the Decoy Partition

```shell
Command (m for help): n
Partition number (1-128, default 1):
First sector (2048-60125150, default 2048):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-60125150, default 60123135): +8G

Created a new partition 1 of type 'Linux filesystem' and of size 8 GiB.
```

#### Write Changes

```shell
Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

Now we have one partition, right?
```shell
❯ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sdc           8:32   1  28,7G  0 disk
└─sdc1        8:33   1     8G  0 part
```

## Encrypt the First Partition

### Generate a Key File

```shell
❯ dd if=/dev/urandom of=keyfile bs=1024 count=4
❯ chmod 400 keyfile
```

### Encrypt the Partition

Now let's use that key file to encrypt the partition.
```shell
❯ sudo cryptsetup luksFormat --type luks2 \
  --cipher aes-xts-plain64 \
  --key-size 512 \
  --hash sha512 \
  --pbkdf argon2id \
  /dev/sdc1 \
  keyfile

WARNING!
========
This will overwrite data on /dev/sdc1 irrevocably.

Are you sure? (Type 'yes' in capital letters): YES
```

### Add a Passphrase (Optional)

```shell
❯ sudo cryptsetup luksAddKey /dev/sdc1 \
  --key-file keyfile
Enter new passphrase for key slot:
Verify passphrase:
```

### Open the Encrypted Container

Using the keyfile:
```shell
❯ sudo cryptsetup open /dev/sdc1 decoy --key-file keyfile
```

Or using the passphrase:
```shell
❯ sudo cryptsetup open /dev/sdc1 decoy
```

Unfortunately, we cannot require both, only one or the other.

## Securely Storing the Keyfile

Never keep the keyfile with you. You can instead use one of the following methods:

### Steganography

Or the art of hiding sensitive data in plain sight.
TODO: Continue writing on this

### SSH

Store it securely on a server using SSH.
TODO: Continue writing on this

## Encrypting the Hidden Data

The process for the second partition is similar, however, we'll be creating a detached header so that the LUKS container is less visible and make the container start AFTER the first 8 GiB partition.
This can be done using the `--header` and `--offset` arguments.

Start by verifying where the partition we created earlier ends.
```shell
❯ sudo fdisk -l /dev/sdc
Disk /dev/sdc: 28,67 GiB, 30784094208 bytes, 60125184 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: EB2E4BBF-92D2-44E8-A25F-9737DF011153

Device     Start      End  Sectors Size Type
/dev/sdc1   2048 16779263 16777216   8G Linux filesystem
```
In this case, it ends at `16779263`. It is safe to pick any offset after this.
8 GiB in bytes is `8589934592`, divide that by the size of the sectors, 512, we obtain `16777216`.
We need to pick the next multiple of 512 after the end of our partition. `16777216+2048=16779264` seems like a good number.


```shell
❯ sudo cryptsetup luksFormat --type luks2 \
  --cipher aes-xts-plain64 \
  --key-size 512 \
  --hash sha512 \
  --pbkdf argon2id \
  --header header.img \
  --offset 16779264 \
  /dev/sdc1 \
  keyfile
```
