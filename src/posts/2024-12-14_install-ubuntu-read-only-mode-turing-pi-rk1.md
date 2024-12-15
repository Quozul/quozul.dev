---
title: "Install Ubuntu in Read-Only Mode on the Turing RK1"
date: '2024-12-14'
tags: [ linux, arm ]
---

This article will cover how to install Ubuntu on the EMMC storage of the RK1, configure it in read-only mode and use the NVME as storage for Docker.

<!-- more -->

Why would you want to install an operating system in read-only mode? Well this is useful to not wear down the EMMC of your Turing RK1 module, we will also be using the NVME as persistent storage for [Docker](https://www.docker.com/).

## Installing Ubuntu

This is the easy step, it can be done through the Turing Pi's BMC, either the web or cli interface.
I recommend using the [Joshua's Ubuntu image](https://github.com/Joshua-Riek/ubuntu-rockchip).
I have personally installed Ubuntu 24.10 to have to most up-to-date kernel.

Once the image is flashed, log into Ubuntu using SSH and do some basic configuration:

```shell
# Freeze the Kernel
❯ sudo apt-mark hold linux-rockchip linux-image-rockchip linux-headers-rockchip linux-tools-rockchip

# Update packages
❯ sudo apt update
❯ sudo apt upgrade -y

# Change the hostname
❯ sudo hostnamectl set-homename nodeX # replace X with your node's number

# Set your SSH key(s)
❯ vim .ssh/authorized_keys # *paste your keys* then exit
```

## Booting in read-only

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

We also have to edit `fstab` by adding the `ro` option:

```
# <file system>                           <mount point> <type> <options>   <dump> <fsck>
UUID=1cf633ab-4f5f-42da-b347-31282732a446 /             ext4   defaults,ro 0      1
```

You have the option to reboot now and have a read-only system, or continue with the configuration.

### Switching between ro and rw

To simplify the maintenance of the system, we will add two commands to switch between read-only and read-write modes.
You can add those aliases in the `/etc/bash.bashrc` file:

```shell
alias ro='sudo mount -o remount,ro /'
alias rw='sudo mount -o remount,rw /'
```

You will notice that once you have switched to read-write mode, you cannot switch back to read-only as the "file system
is busy". This is because the system is writing temporary files and logs.

### Temporary file systems

The system will always want to write some temporary files, such as logs.
For this, we will configure `fstab` to mount those directories using the `tmpfs` file system.
You can add the following lines to your `fstab`:

```
tmpfs /run     tmpfs nosuid,nodev 0 0
tmpfs /tmp     tmpfs nosuid,nodev 0 0
tmpfs /var/log tmpfs nosuid,nodev 0 0
tmpfs /var/tmp tmpfs nosuid,nodev 0 0
```

## Getting Docker working

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

I will use the device `/dev/nvme0n1p1` as persistent storage for Docker.
You may want to partition the NVME device, but I will not cover this here.
First, create a file system on the partition:

```shell
❯ sudo mkfs.ext4 /dev/nvme0n1p1
```

Then, switch to read-write mode and add the volume to `/etc/fstab`. You can check
out [my guide about how to configure `fstab`](https://quozul.dev/posts/configuring-fstab/) properly.

For my case, I will have to add the following line, also, I mount the `/ver/lib` directory directly as this is used by other services such as `containerd`.

```
UUID=d6fa8295-65be-4c38-b7c5-161a20097ac9 /var/lib ext4 rw,noatime,discard 0 2
```

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
