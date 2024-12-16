---
title: "Install Ubuntu in Read-Only Mode on the Turing RK1"
date: '2024-12-14'
tags: [ linux, arm ]
---

This article will cover how to install Ubuntu on the EMMC storage of the RK1, configure it in read-only mode and use the NVME as storage for Docker.

<!-- more -->

Why would you want to install an operating system in read-only mode?
Well, this is useful if you want to keep the operating system on the EMMC while limiting the wear of the EMMC of your [Turing RK1](https://turingpi.com/product/turing-rk1/) module.
We will also be using the NVME as persistent storage for [Docker](https://www.docker.com/).

## Installing Ubuntu

This is the easy step, it can be done through the Turing Pi's BMC, either the web or cli interface.
I recommend using the [Joshua's Ubuntu image](https://github.com/Joshua-Riek/ubuntu-rockchip).
I have personally installed Ubuntu 24.10 to have to most up-to-date kernel.

Once the image is flashed, log into Ubuntu using SSH and do some basic configuration:

```shell
# Freeze the Kernel
# Only applicable if you are following along with the RK1
❯ sudo apt-mark hold linux-rockchip linux-image-rockchip linux-headers-rockchip linux-tools-rockchip

# Update packages
❯ sudo apt update
❯ sudo apt upgrade -y

# Change the hostname
❯ sudo hostnamectl set-homename nodeX # replace X with your node's number

# Set the timezone
❯ sudo dpkg-reconfigure tzdata

# Set your SSH key(s)
❯ vim .ssh/authorized_keys # *paste your keys* then exit
```

If you are running a x86 machine, use the official ISO to install Ubuntu and you can skip the `apt-mark hold` command.

## Booting in read-only

### Turing RK1
Next we will set Ubuntu to boot in read-only. This is done by editing the boot command line arguments.

```shell
❯ sudo vim /etc/kernel/cmdline
```

Simply replace `rw` with `ro`.
You should have a line that looks something like this:

```
rootwait rw console=ttyS0,115200 console=tty1 cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory
```

Next we have to update U-Boot:

```shell
❯ sudo u-boot-update
```

You can find mode details about how to configure the boot command line arguments over on [ubuntu-rockship repository's wiki](https://github.com/Joshua-Riek/ubuntu-rockchip/wiki).


### x86 machines
I have also tested this on an x86 virtual machine.
The process is similar, but the kernel's command line arguments are not stored at the same place and we cannot use `u-boot-update`.
Instead we have to update the grub configuration:
```shell
❯ sudo vim /etc/default/grub
```
Locate the line that starts with `GRUB_CMDLINE_LINUX` and add `ro` to the end of the line.
```shell
GRUB_CMDLINE_LINUX="ro"
```
Then update grub:
```shell
❯ sudo update-grub
```

### Editing `fstab`

We also have to edit `fstab` by adding the `ro` option:

```
# <file system>                           <mount point> <type> <options>   <dump> <fsck>
UUID=1cf633ab-4f5f-42da-b347-31282732a446 /             ext4   defaults,ro 0      1
```

You have the option to reboot now and have a completely read-only system, or continue with the configuration.

## Switching between ro and rw

To simplify the maintenance of the system, we will add two commands to switch between read-only and read-write modes.
You can add those aliases in the `/etc/bash.bashrc` file:

```shell
alias ro='mount -o remount,ro /'
alias rw='mount -o remount,rw /'
```

You will notice that once you have switched to read-write mode, you cannot switch back to read-only as the "file system
is busy". This is because the system is writing temporary files and logs.

## Temporary file systems

The system will always want to write some temporary files, such as logs.
For this, we will configure `fstab` to mount those directories using the `tmpfs` file system.
You can add the following lines to your `fstab`:

```
tmpfs /tmp     tmpfs nosuid,nodev  0 0
tmpfs /run     tmpfs nosuid,noexec 0 0
tmpfs /var/log tmpfs nosuid,nodev  0 0
tmpfs /var/tmp tmpfs nosuid,nodev  0 0
```

---

## Getting Docker working

### Installing Docker

Let's install Docker first.
You have to switch to read-write mode to install Docker.
The installation of Docker can be done with one single command:

```shell
❯ curl -Ssl https://get.docker.com/ | bash
```

If you reboot now, you will notice that Docker does not start because it tries to write to `/var/lib/docker` which is in read-only:

```shell
❯ sudo journalctl -fu docker
node4 systemd[1]: Starting docker.service - Docker Application Container Engine...
node4 dockerd[1186]: chmod /var/lib/docker: read-only file system
```

To fix that and have Docker working on our system, we have to mount a persistent volume to `/var/lib/docker`.
Again, this can be done using `fstab`.

### Persisting /var/lib

I will use the device `/dev/nvme0n1p1` as persistent storage for Docker.
You may want to partition your device to your likings, but I will not cover this here.
First, create a file system on the partition:

```shell
❯ sudo mkfs.ext4 /dev/nvme0n1p1
```

I will be mounting the NVME partition to `/var/lib`.
This will allow us to run Docker and most other programs without any issues.
We will even be able to run `apt update`!
But not `upgrade` since that will write files somewhere else.
Only the write to apt caches won't work and will show a warning, feel free to add a `tmpfs` for that if you want.

We will have to mount this directory to the `/mnt` directory and copy the current files from `/var/lib` to the new volume.
If the directory `/mnt` does not exist, you can create it with `sudo mkdir /mnt`.

```shell
❯ sudo mount /dev/nvme0n1p1 /mnt
❯ sudo cp -r /var/lib/* /mnt
❯ sudo umount /mnt
```

Then, switch to read-write mode and add the volume to `/etc/fstab`. You can check
out [my guide about how to configure `fstab`](https://quozul.dev/posts/configuring-fstab/) properly.

```
UUID=d6fa8295-65be-4c38-b7c5-161a20097ac9 /var/lib ext4 defaults 0 1
```

### Starting Docker

Switch back to read-only mode, and let's check if Docker starts!
You can do this by simply rebooting, or manually as shown bellow:

```shell
❯ sudo systemctl daemon-reload
❯ sudo mount -a
❯ sudo systemctl start contaierd.service docker.service
❯ sudo docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
478afc919002: Pull complete
Digest: sha256:5b3cc85e16e3058003c13b7821318369dad01dac3dbb877aac3c28182255c724
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.
```

## Next steps

What's next? Well I would like to use my Turing Pi as a Docker Swarm cluster, but this requires persistent storage for volumes to be shared across all nodes. I will be looking into configuring Ceph on my nodes.
