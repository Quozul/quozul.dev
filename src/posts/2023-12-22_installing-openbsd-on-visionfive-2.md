---
date: '2023-12-22'
title: Installing OpenBSD 7.4 on a VisionFive 2 rev 1.2a
draft: false
tags: [riscv, openbsd]
oldUrl: /riscv/2023/12/22/installing-openbsd-on-visionfive-2
---
Linux feels a bit sluggish on the [VisionFive 2](https://www.starfivetech.com/en/site/boards){target="_blank"}, so I wanted to install [OpenBSD](https://www.openbsd.org/){target="_blank"} on my board since a RISC-V port is available.

<!--more-->

## Requirements
- Serial to USB adapter
- eMMC module (mine is VA001-32G)
- SD card
- VisionFive 2 (mine is rev 1.2a from [the Kickstarter campaign](https://www.kickstarter.com/projects/starfive/visionfive-2){target="_blank"})

## Installing OpenBSD

### Preparing the boot drive

First step, download the image from [OpenBSD's official website](https://www.openbsd.org/faq/faq4.html#Download){target="_blank"}.
Then flash it onto an SD card.

Then you'll have to get a copy of the DTB file, it is not the one in the GitHub releases, [rpx made a great script to build it from source](https://forum.rvspace.org/t/dtb-creation-from-source/3473){target="_blank"}. You can find download links at the end of this article.

Mount the EFI partition from the SD card and add it in the root of the partition.
It should end up being something like this:
```
/
├─ efi/
│  ├─ boot/
│  │  ├─ bootriscv64.efi
├─ jh7110-starfive-visionfive-2-v1.2a.dtb
```

If you have a version 1.3 of the board, you have to use the `jh7110-starfive-visionfive-2-v1.3.dtb` file instead. 

Unmount and disconnect the SD card.

### Booting into the installer

Insert the SD card in your VisionFive 2 board.

Make sure you are connected to the board with a serial connection in order to interrupt the boot process when you see
this prompt:
```sh
Hit any key to stop autoboot:  0 
StarFive # 
```

Next load up the DTB and OpenBSD kernel from the SD card:
```sh
StarFive # load mmc 1:1 ${fdt_addr_r} jh7110-starfive-visionfive-2-v1.2a.dtb
StarFive # load mmc 1:1 ${kernel_addr_r} efi/boot/bootriscv64.efi
StarFive # bootefi ${kernel_addr_r} ${fdt_addr_r}
```

### Installing the OS

Follow the installation process like you normally would.
I had troubles using CloudFlare's DNS, but using ftp.fr.openbsd.org worked without any issues.

Once the install is done, you can reboot.

### Booting into OpenBSD

To simply boot into OpenBSD in the current state, you can swap the 1 with a 0 for the mmc module in the second command above:
```sh
StarFive # load mmc 1:1 ${fdt_addr_r} jh7110-starfive-visionfive-2-v1.2a.dtb;
StarFive # load mmc 0:1 ${kernel_addr_r} efi/boot/bootriscv64.efi;
                  # ^ the change is here
StarFive # bootefi ${kernel_addr_r} ${fdt_addr_r}
```

### Moving the DTB file off of the SD card

If you wish to remove the SD card, you can move the DTB file onto the eMMC module.

To do so, you can try and adapt the following commands:

```sh
qzl# disklabel sd0  #< check the partitions on the eMMC module
#...
#                size           offset  fstype [fsize bsize   cpg]
  a:          2097152            65536  4.2BSD   2048 16384 12960 # /
  b:          4015300          2162688    swap                    # none
  c:         61071360                0  unused                    
  d:          3326880          6178016  4.2BSD   2048 16384 12944 # /tmp
  e:          5170720          9504896  4.2BSD   2048 16384 12960 # /var
  f:          6923456         14675616  4.2BSD   2048 16384 12960 # /usr
  g:          1941856         21599072  4.2BSD   2048 16384 12960 # /usr/X11R6
  h:          7874336         23540928  4.2BSD   2048 16384 12960 # /usr/local
  i:            32768            32768   MSDOS                                  # this looks like the efi partition (indicated by the msdos fstype)
  j:          3842272         31415264  4.2BSD   2048 16384 12960 # /usr/src
  k:         12026336         35257536  4.2BSD   2048 16384 12960 # /usr/obj
  l:         13787488         47283872  4.2BSD   2048 16384 12960 # /home

qzl# disklabel sd1  # check the partitions on the sd card
#...
#                size           offset  fstype [fsize bsize   cpg]
  a:           991232            40960  4.2BSD   2048 16384 16142 
  c:        249645056                0  unused                    
  i:             8192            32768   MSDOS                                  # this looks like the efi partition (indicated by the msdos fstype)
```

Create mounting points and mount the partitions
```sh
qzl# mkdir -p /mnt/sd0
qzl# mkdir -p /mnt/sd1
qzl# mount -t msdos /dev/sd0i /mnt/sd0
qzl# mount -t msdos /dev/sd1i /mnt/sd1
```

Copy the file and unmount
```sh
qzl# cp /mnt/sd1/jh7110-starfive-visionfive-2-v1.2a.dtb /mnt/sd0/jh7110-starfive-visionfive-2-v1.2a.dtb
qzl# umount /mnt/sd1
qzl# umount /mnt/sd0
```

### Tweaking U-Boot to automatically boot into OpenBSD

Backup previous bootcmd
```sh
StarFive # echo $bootcmd
run load_vf2_env;run importbootenv;run boot2;run distro_bootcmd
```

Set new bootcmd from eMMC, this is basically the above commands saved in the environment variable.
```sh
StarFive # setenv bootcmd 'load mmc 0:1 ${fdt_addr_r} jh7110-starfive-visionfive-2-v1.2a.dtb;load mmc 0:1 ${kernel_addr_r} efi/boot/bootriscv64.efi;bootefi ${kernel_addr_r} ${fdt_addr_r}'
StarFive # saveenv
```

Note that we are now using `0:1` for the `jh7110-starfive-visionfive-2-v1.2a.dtb` file since we moved it from the SD card to the eMMC storage.

Reboot and the board should automatically boot into OpenBSD.

#### Resources I used to get here

- github.com: [Installing OpenBSD 7.3-current on a VisionFive2](https://gist.github.com/csgordon/74658096f7838382b40bd64e11f6983e){target="_blank"}
- openbsd.org: [INSTALL.riscv64](https://ftp.openbsd.org/pub/OpenBSD/7.4/riscv64/INSTALL.riscv64){target="_blank"}
- openbsd.org: [OpenBSD Mirrors](https://www.openbsd.org/ftp.html){target="_blank"}
- rvspace.org: [Dtb creation from source](https://forum.rvspace.org/t/dtb-creation-from-source/3473){target="_blank"}
- rvspace.org: [OpenBSD 7.4 (very very very soon)?](https://forum.rvspace.org/t/openbsd-7-4-very-very-very-soon/3701/3){target="_blank"}
- stackexchange.com: [How to make sd card as default boot in uboot?](https://unix.stackexchange.com/questions/120909/how-to-make-sd-card-as-default-boot-in-uboot){target="_blank"}

#### Downloads

- [dtb_obsd.sh](/uploads/dtb_obsd.sh)
- [jh7110-starfive-visionfive-2-v1.2a.dtb](/uploads/jh7110-starfive-visionfive-2-v1.2a.dtb).
- [jh7110-starfive-visionfive-2-v1.3b.dtb](/uploads/jh7110-starfive-visionfive-2-v1.3b.dtb).
