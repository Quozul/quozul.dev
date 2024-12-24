---
title: "Create a Ceph cluster using cephadm"
date: '2024-12-15'
tags: [ linux ]
draft: true
---

In this article we will cover how to create a Ceph cluster using `cephadm`.

<!-- more -->

I will be using Ubuntu 24.10 for this guide, but it should work on other distributions as well.

```shell
# Install cephadm
❯ sudo apt install cephadm

# Bootstrap a Ceph cluster
❯ sudo cephadm bootstrap --mon-ip 10.0.1.7
```

```
# Enter Ceph shell
❯ sudo cephadm shell

# Add a full disk
❯ ceph orch daemon add osd --method raw ubuntu:/dev/sdc

# If adding a full disk crashes, try disabling the "MongoDB Compass" apparmor profile (on the host)
❯ sudo apparmor_parser -R /etc/apparmor.d/MongoDB_Compass
```
