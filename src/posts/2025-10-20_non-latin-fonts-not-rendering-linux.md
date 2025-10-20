---
title: Non‑Latin Fonts not Rendering on Linux
date: '2025-10-20'
tags: [linux, font]
---

This is more of a note for the future me. For a while, any non‑Latin fonts were not rendering on my ArchLinux install. Here's how I fixed it!

<!--more-->

## The Issue

Well, the issue is simple: any non‑Latin text such as 日本語 was rendering using a default and very unreadable font even though I installed compatible fonts.

```shell
❯ sudo pacman -S noto-fonts-cjk
warning: noto-fonts-cjk-20240730-1 is up to date -- reinstalling
resolving dependencies...
looking for conflicting packages...

Packages (1) noto-fonts-cjk-20240730-1

Total Installed Size:  298,79 MiB
Net Upgrade Size:        0,00 MiB

:: Proceed with installation? [Y/n]

# logs omitted
Fontconfig error: failed reading config file: /etc/fonts/conf.d:  (errno 21)
Fontconfig error: failed reading config file: /usr/share/fontconfig/conf.avail:  (errno 21)
```

When reinstalling the font, I noticed two errors, so I started looking around on how to fix this. That's when I found [a bug report](https://bugs.archlinux.org/task/70305) on the ArchLinux bug tracker.

## Resolving the Issue

Checking the directory with `stat` revealed that its access time was set in the future for some reason—how could that be? I'm not a time traveler, after all!

```shell
❯ stat /etc/fonts/conf.d
  File: /etc/fonts/conf.d
  Size: 4096      	Blocks: 8          IO Block: 4096   directory
Device: 253,0	Inode: 12846209    Links: 2
Access: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2044-01-09 10:29:38.946741909 +0100
```

So yeah, the fix is super simple: all I needed to do was `touch` the directory and the file:

```shell
❯ sudo touch /etc/fonts/conf.d
❯ sudo touch /usr/share/fontconfig/conf.avail
```

Look, now it is fixed!

```shell
❯ stat /etc/fonts/conf.d
  File: /etc/fonts/conf.d
  Size: 4096      	Blocks: 8          IO Block: 4096   directory
Device: 253,0	Inode: 12846209    Links: 2
Access: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2025-10-20 18:46:12.480586532 +0200
```

Well, for now at least; I guess in [2038](https://en.wikipedia.org/wiki/Year_2038_problem) all fonts will stop working…

As an additional step, you could also clear the font cache with:

```shell
❯ sudo fc-cache -f -v
```
