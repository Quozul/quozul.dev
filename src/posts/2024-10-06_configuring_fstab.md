---
title: Configuring fstab like a champ!
date: '2024-10-06'
tags: [linux]
oldUrl:
  - /posts/configuring-fstab/
---

I never remember how to configure fstab properly and always end up breaking my system. Let's write a guide on how I configure my fstab so that I don't make the same mistakes twice!

<!-- more -->

## Mounting a partition

### Manual mounting

I usually have at least two disks on my computers and I want to have the second to be always mounted. First, identify the device name using `lsblk`:

```shell
❯ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda           8:0    0   3,6T  0 disk
└─sda1        8:1    0   3,6T  0 part
```

In my case, I want to mount the `/dev/sda1` partition to `/mnt/data`.

To do so, we will have to create the mountpoint using, then we can manually mount it.

```shell
❯ sudo mkdir -p /mnt/data
❯ sudo mount /dev/sda1 /mnt/data
```

With that, the parition is accessible on `/mnt/data`. To unmount it you can use the next command:

```shell
❯ sudo umount /mnt/data
```

### Mounting on boot using fstab

That's great, but we want this partition to always be mounted, that's where fstab comes into play!
Let's check the content we currently have in our fstab:

```shell
❯ cat /etc/fstab
# <file system> <mount point> <type> <options> <dump> <fsck>
UUID=11638cc4-09f7-4a7d-9c5f-8c5939a70f30 / ext4 defaults 0 1
```

For now, we only have the mountpoint created by the installer of our distribution.

Before adding the drive, we have to find out its unique identifier and type of the file system.
This can be done using the `blkid` command with the name of the partition we want to mount.

```shell
❯ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda           8:0    0   3,6T  0 disk
└─sda1        8:1    0   3,6T  0 part
❯ sudo blkid /dev/sda1
/dev/sda1: UUID="db48a9a3-1fcb-40f0-b9aa-a21500125bc2" BLOCK_SIZE="4096" TYPE="ext4" PARTLABEL="Data" PARTUUID="403fb8fe-0b1b-4466-89ec-3a4cd0aee75f"
```

What we are interested in is the first UUID and the TYPE value.
Let's add our second drive by appending a line to fstab with our favorite editor.

```shell
# <file system> <mount point> <type> <options> <dump> <fsck>
# UUID=<UUID> /mnt/data <TYPE> rw,noatime,discard,x-gvfs-show 0 2
UUID=db48a9a3-1fcb-40f0-b9aa-a21500125bc2 /mnt/data ext4 rw,noatime,discard,x-gvfs-show 0 2
```

Here is a little breakdown of the options:

- **rw** : Mount the filesystem read-write.
- **noatime** : Do not update inode access times on this filesystem.
- **discard** : If set, causes discard/TRIM commands to be issued to the block device when blocks are freed. This is useful for SSD devices.
- **x-gvfs-show** : This option is used by GNOME Virtual File System (GVFS) to show this filesystem in graphical file managers like Nautilus. It makes it easier for users to see and interact with the mounted filesystem through the GUI.

Many more options are available, check `man 8 mount` for more information.

Now we are ready to use this new fstab, make sure you reload systemd and **test the configuration file first!** No need to reboot the system to test if the drive is mounted. This is the step I often skip and causes me a lot of wasted time.

```shell
❯ sudo systemctl daemon-reload
❯ sudo mount -a
```

If an error is shown, fix the fstab before rebooting, otherwise your operating system might not boot anymore (and it's a pain to fix!)
Otherwise, if everything went well, you should see the mountpoint using the `lsblk` command:

```shell
❯ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda           8:0    0   3,6T  0 disk
└─sda1        8:1    0   3,6T  0 part  /mnt/data
```
