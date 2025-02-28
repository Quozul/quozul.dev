---
title: "Installing Ceph: Adding More Nodes to my Ceph Cluster"
date: '2024-12-27'
tags: [ linux, ceph ]
draft: true
---

In this article I will cover how I added more nodes to my Ceph Cluster.

<!-- more -->

```shell
❯ sudo apt update && \
  sudo apt upgrade -y && \
  sudo apt purge snapd -y && \
  sudo apt install ceph vim -y && \
  sudo apt autoremove -y
```

Copy the following three files from the first node to the new node.
```
/etc/ceph/ceph.conf
/etc/ceph/ceph.client.admin.keyring
/var/lib/ceph/bootstrap-osd/ceph.keyring
```

Create the volume.
```shell
sudo ceph-volume lvm create --data /dev/sdb2
```

Mount the volume.
```
sudo mount -t ceph admin@.cephfs=/ /mnt/mycephfs
```

Update the pool size.

Remove the last warning "2 pool(s) have no replicas configured"
```
ubuntu@node1:~$ sudo ceph osd pool set cephfs_data size 3
set pool 1 size to 3
ubuntu@node1:~$ sudo ceph osd pool set cephfs_data min_size 2
set pool 1 min_size to 2
ubuntu@node1:~$ sudo ceph osd pool set cephfs_metadata size 3
set pool 2 size to 3
ubuntu@node1:~$ sudo ceph osd pool set cephfs_metadata min_size 2
set pool 2 min_size to 2
```
