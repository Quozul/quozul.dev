---
title: "Compiling U-Boot for the Turing RK1"
date: '2024-10-12'
tags: [linux, arm]
oldUrl:
  - /posts/build-custom-image-for-turing-pi-rk1/
---

I recently received the Turing Pi 2.5 with 4 Turing RK1 modules, I wanted to build and maintain my own operating system images for the RK1s.

<!-- more -->

The first step in this adventure, is to build the bootloader, U-Boot.

## Pre-requirements

I am using ArchLinux, the commands below will be for this operating system.
First, you'll have to install the appropriate GCC toolchain as well as any other dependencies required, I may forgot to list some in the command below.

```shell
❯ sudo pacman -S aarch64-linux-gnu-gcc make git
```

## Getting required Blobs for building U-Boot

If you try to jump directly to building U-Boot, you will eventually run into the following two missing blobs.

Clone [rkbin](https://github.com/rockchip-linux/rkbin):
```shell
❯ git clone https://github.com/rockchip-linux/rkbin.git
```

Then look for the following two files:
- `rk3588_bl31_v1.45.elf`
- `rk3588_ddr_lp4_2112MHz_lp5_2400MHz_v1.16.bin`

Both should be in the `rkbin/bin/rk35` directory inside the repository.

### OP-TEE (optional)

OP-TEE seems to not support the RK3588 for now.
Repository: [https://github.com/OP-TEE/optee_os](https://github.com/OP-TEE/optee_os).
U-Boot will still build fine without OP-TEE, although you may get a warning.

### atf-bl31

While this blob is included in the `rkbin` repository, you may want to compile it yourself. Although I did not have much success with it as it caused the Linux kernel to not boot.

1. Clone [arm-trusted-firmware](https://github.com/ARM-software/arm-trusted-firmware):
   ```shell
   ❯ git clone https://github.com/ARM-software/arm-trusted-firmware.git
   ```

2. Build:\
   You can check the value for `PLAT` by checking in the `plat` directory of the repository.
   ```shell
   ❯ make PLAT=rk3588 CROSS_COMPILE=aarch64-linux-gnu- bl31 -j
   ```
   Write down the path for `bl31.elf` outputed at the end of the build.

## Building U-Boot

1. Clone [U-Boot](https://github.com/u-boot/u-boot):
   ```shell
   ❯ git clone https://source.denx.de/u-boot/u-boot.git
   ```

2. Make the default config for the RK1:

   Device Tree Source Code of the RK1 is included in the main branch, you can check with:
   ```shell
   ❯ ls arch/arm/dts | grep turing
   rk3588-turing-rk1-u-boot.dtsi
   ```

   Check the default config name then create the config from the default config:
   ```shell
   ❯ ls configs/ | grep turing
   turing-rk1-rk3588_defconfig
   ❯ make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- turing-rk1-rk3588_defconfig
   #
   # configuration written to .config
   #
   ```

3. Building U-Boot:\
   I had to install a few additionnal dependencies before building.
   ```shell
   ❯ sudo pacman -S swig
   ❯ pip install pyelftools
   ❯ ROCKCHIP_TPL=../rkbin/bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2400MHz_v1.16.bin \
         BL31=../rkbin/bin/rk35/rk3588_bl31_v1.45.elf \
         ARCH=arm64 \
         CROSS_COMPILE=aarch64-linux-gnu- \
         make -j
   ```

## Create the bootloader image

```shell
❯ dd if=/dev/zero of=bootloader.img bs=512 count=32767
❯ dd if=./idbloader.img of=bootloader.img bs=512 seek=64 conv=notrunc
❯ dd if=./u-boot.itb of=bootloader.img bs=512 seek=16384
```

## Flashing on a Node

Flash the iamge on the node using `tpi`:
```shell
❯ tpi flash --image-path ./bootloader.img --node 4
```

Now your RK1 module should boot into U-Boot, you can check with the following command:
```shell
❯ tpi uart --node 4 get
```

## Next steps

Actually install an operating system on the NVME!

## Resources

Here is a list of additional resources I used to get here:
- [https://opensource.rock-chips.com/wiki_U-Boot](https://opensource.rock-chips.com/wiki_U-Boot)
- [https://wiki.radxa.com/Rock5/dev/Debian](https://wiki.radxa.com/Rock5/dev/Debian)
