---
title: "PicoLimbo"
site_url: "https://picolimbo.quozul.dev"
github_url: "https://github.com/Quozul/PicoLimbo"
tags: [ minecraft, server ]
date: "2024-12-07"
---

A lightweight limbo Minecraft server written from scratch in Rust supporting Minecraft versions from 1.7.2 up to the most recent ones.

<!--more-->

## What is PicoLimbo?

PicoLimbo is a lightweight [limbo server](/posts/2025-05-14-what-are-minecraft-limbo-servers/) written
in Rust, designed primarily as an AFK or waiting server. Its core focus is on efficiency by implementing only essential
packets required for client login and maintaining connection (keep-alive) without unnecessary overhead.

When idle, PicoLimbo uses almost no resources: 0% CPU and less than 10 MB of memory, making it extremely lightweight.

While not aiming to replicate every Minecraft server feature, PicoLimbo supports all Minecraft versions.
