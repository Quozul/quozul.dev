---
title: Running GPT-OSS 120b on AMD Ryzen AI Max+ 395
date: '2025-10-19'
tags: [ai, rocm]
draft: true
---

I just received my Framework Desktop Motherboard, with the AMD Ryzen AI Max+ 395 and 128 GB of unified memory. Let's get the huge GPT-OSS with 120 billions parameters running on that thing!

<!--more-->

The plan is to use llama.cpp to run GPT-OSS 120b. But first of all, we gotta get this thing running.

## Choosing a Distribution

For the operating system I'll be using Ubuntu Server 24.04.3 which is the latest version at the time of writing this.
ROCm officially supports a few distributions but I choose to go with Ubuntu as this is the most common distro.
After installing the OS, make sure it is up-to-date.
```shell
sudo apt update
sudo apt upgrade
```

## Upgrade the Kernel

This APU is officially supported since ROCm version 7.0.2. However to get ROCm 7.0.2 running, we must use the kernel 6.14 or better.
Ubuntu 24.04 ships by default with 6.8 but thanksfully we can update to Hardware Enablement, or HWE for short, with a single command:
```shell
sudo apt install --install-recommends linux-generic-hwe-24.04
```

## Installing ROCm

Those are the commands that I used at the time of writing, but please check the sources at the bottom of this post to read more and use more up-to-date commands.

First, we install the amdgpu-install utility:
```shell
sudo apt update
wget https://repo.radeon.com/amdgpu-install/7.0.2/ubuntu/noble/amdgpu-install_7.0.2.70002-1_all.deb
sudo apt install ./amdgpu-install_7.0.2.70002-1_all.deb
```

We can then use this utility to install ROCm drivers by specifying the appropriate usecase:
```shell
amdgpu-install -y --usecase=rocm --no-dkms
```

## Compiling Llama.cpp

Sources:
- https://ubuntu.com/kernel/lifecycle
- https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/install/installryz/native_linux/install-ryzen.html
