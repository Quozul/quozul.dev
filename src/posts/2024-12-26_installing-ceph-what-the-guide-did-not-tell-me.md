---
title: "Installing Ceph: What the Guide did not tell me"
date: '2024-12-26'
tags: [ linux, ceph ]
draft: false
---

In this article I will cover how I created a Ceph cluster on a single node.

<!-- more -->

I will be using Ubuntu 24.10 for this guide, but it should work on other distributions as well.
Also, I am using Ceph Squid which was the most recent version of Ceph at the time of writing this.

I found a guide on the official website on [how to manually deploy Ceph](https://docs.ceph.com/en/squid/install/manual-deployment/).
However, as always, some important information were missing in the guide which got me stuck.
Which is why I write this additional guide so I do not forget how to deploy Ceph in the future.
Other than that, the guide is fairly detailed if read carefully.

## Dependencies

First, I will do a basic maintenance of my system and install Ceph.
I don't like snap, so I will get rid of it as well.
```shell
❯ sudo apt update && \
  sudo apt upgrade -y && \
  sudo apt purge snapd -y && \
  sudo apt install ceph -y && \
  sudo apt autoremove -y
```

## Monitor Bootstrapping

About the `ceph.conf` file, make sure you fill it out completely first thing as it will be required for the `monmaptool` command which is provided by the guide before filling the config file.

If deploying Ceph on a single node, update the following two lines:
```toml
osd_pool_default_size = 1
osd_pool_default_min_size = 1
```

## Manager daemon configuration

This section is quite small on the guide, I did not saw it and skipped it, which resulted in the deployment not working! Dumb mistake…

Once the mgr is created, it can be started with `sudo systemctl start ceph-mgr@{hostname}`.

The following command can be used to check the status of your mgr, which should look something like this:
```
❯ sudo ceph mgr stat
{
    "epoch": 142,
    "available": true,
    "active_name": "ubuntu",
    "num_standby": 0
}
```

## Removing some warnings

Even though I followed the guide, by the end `ceph status` reported some warnings, which I fixed by running those two commands:
```shell
# Gets rid of "mon is allowing insecure global_id reclaim"
❯ sudo ceph config set mon auth_allow_insecure_global_id_reclaim false
# Gets rid of "1 monitors have not enabled msgr2"
❯ sudo ceph mon enable-msgr2
```
However I have yet to find how to fix "12 mgr modules have failed dependencies".

## Adding OSDs

Simply use the "Short form" in the guide which is a single command:
```shell
❯ sudo ceph-volume lvm create --data $DEVICE # for example, "/dev/sdb1"
❯ sudo ceph-volume lvm list
```

## Adding MDS

So the "{id}" that is specified in the guide, it is actually the hostname! And "{cluster-name}" is "ceph" by default.

Make sure you give the permissions to the ceph user on the `/var/lib/ceph/mds/{cluster-name}-{hostname}/keyring` file.

```shell
❯ sudo chown ceph:ceph /var/lib/ceph/mds/{cluster-name}-{hostname}/keyring
```

The command `service ceph start` does not work, you should be able to start it with `sudo systemctl start ceph-mds@{hostname}` instead.

If this does not work, you can always start it manually and check if the output contains any errors.
The `--cluster {cluster-name}` argument can be omited if you use the default cluster name, which is "ceph".
```shell
❯ sudo ceph-mds --cluster {cluster-name} -i {hostname} -m {ip-address}:6789
```

The following command can be used to check the status of your mds, which should look something like this:
```shell
❯ sudo ceph mds stat
cephfs:1 {0=ubuntu=up:active}
```

## Starting Ceph on boot

If everything went well, Ceph can be started on boot using:
```shell
❯ sudo systemctl enable --now ceph-mon@{hostname} ceph-mds@{hostname} ceph-mgr@{hostname}
```
