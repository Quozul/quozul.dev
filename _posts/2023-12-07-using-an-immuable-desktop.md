---
layout: post
title:  "Using an immuable desktop"
date:   2023-12-07 08:50:00 +0100
categories: linux
---
I've been using Linux for years now, one of the main issue I am still getting after all these years is having the package manager fail during an update.

It can be due to the computer restarting in the middle of an update or the terminal crashing, making the update transaction fail. I've noticed this is especially the case using Ubuntu:

```
You might want to run 'apt --fix-broken install' to correct these.
```

Never have I seen this command work.

Recently Canonical have been aggressively pushing the use of their new packaging method, Snap.

After much struggles, I ended up using [Fedora Workstation](https://fedoraproject.org/), the distro is well updated, always having the most up-to-date kernel and packages.
It uses the [Gnome desktop environment](https://www.gnome.org/) by default, and does not add many customization over the default desktop environment, unlike Ubuntu.

But after many years, during the upgrade to Fedora 39, the package manager as once again failed me, because my computer crashed during the update.

For some time, I've been aware of the existance of "immuable distros" and been wondering what it's like to use these. So when my current installation of Fedora Workstation broke, I finally decided to install [Fedora Silverblue](https://fedoraproject.org/en/silverblue/).

It has been about two months since I installed it for the first time, and it has been amazing. While it is a little bit annoying to have to restart the OS everytime I install a package, I feel way more confident that my system won't break for some weird reasons.

The package manager is just as good as DNF from Fedora Workstation, while providing some extra features from OSTree, combining best of both worlds.

We say it has an immuable file system, but the only thing that is immuable, are system files that we really rarely update, unless you are a ricer, but you should be using Arch if that's the case anyway.

I'll be sure to keep you updated if I have any new issues with this OS!

