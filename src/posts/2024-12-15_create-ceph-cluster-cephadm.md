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
