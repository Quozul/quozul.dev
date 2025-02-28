#!/bin/bash

# Example usage:
# curl -sSL https://quozul.dev/uploads/install-ceph.sh | bash -s -- end0 /dev/nvme0n1p2

set -x
set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <interface-name> <device>"
    exit 1
fi

get_ip_and_prefix() {
    local interface=$1
    ip -o -4 addr show dev "$interface" | awk '{print $4}'
}

calculate_network_address() {
    local ip_address=$1
    local cidr_prefix=$2

    IFS='.' read -r i1 i2 i3 i4 <<< "$ip_address"
    local mask=$((0xFFFFFFFF << (32 - cidr_prefix) & 0xFFFFFFFF))
    local m1=$((mask >> 24 & 0xFF))
    local m2=$((mask >> 16 & 0xFF))
    local m3=$((mask >> 8 & 0xFF))
    local m4=$((mask & 0xFF))
    local n1=$((i1 & m1))
    local n2=$((i2 & m2))
    local n3=$((i3 & m3))
    local n4=$((i4 & m4))

    echo "$n1.$n2.$n3.$n4/$cidr_prefix"
}

IFNAME=$1
DEVICE=$2
# TODO: Verify device exists

ip_and_prefix=$(get_ip_and_prefix "$IFNAME")
ip_address=$(echo $ip_and_prefix | cut -d'/' -f1)
cidr_prefix=$(echo $ip_and_prefix | cut -d'/' -f2)
network_address=$(calculate_network_address "$ip_address" "$cidr_prefix")

CLUSTER_NAME="ceph"
FSID=$(uuidgen)
NET_ADDR="$network_address"
HOSTNAME=$(hostname)

# Bootstraping
cat <<EOF | sudo tee -a /etc/ceph/ceph.conf > /dev/null
[global]
fsid = $FSID
mon_initial_members = $HOSTNAME
mon_host = [v2:$ip_address:3300/0,v1:$ip_address:6789/0]
public_network = $NET_ADDR
auth_cluster_required = cephx
auth_service_required = cephx
auth_client_required = cephx
osd_pool_default_size = 1
osd_pool_default_min_size = 1
osd_pool_default_pg_num = 333
osd_crush_chooseleaf_type = 1
EOF

sudo ceph-authtool --create-keyring /tmp/ceph.mon.keyring --gen-key -n mon. --cap mon 'allow *'
sudo ceph-authtool --create-keyring /etc/ceph/ceph.client.admin.keyring --gen-key -n client.admin --cap mon 'allow *' --cap osd 'allow *' --cap mds 'allow *' --cap mgr 'allow *'
sudo ceph-authtool --create-keyring /var/lib/ceph/bootstrap-osd/ceph.keyring --gen-key -n client.bootstrap-osd --cap mon 'profile bootstrap-osd' --cap mgr 'allow r'
sudo ceph-authtool /tmp/ceph.mon.keyring --import-keyring /etc/ceph/ceph.client.admin.keyring
sudo ceph-authtool /tmp/ceph.mon.keyring --import-keyring /var/lib/ceph/bootstrap-osd/ceph.keyring
sudo chown ceph:ceph /tmp/ceph.mon.keyring
monmaptool --create --add $HOSTNAME $ip_address --fsid $FSID /tmp/monmap
sudo -u ceph mkdir -p /var/lib/ceph/mon/$CLUSTER_NAME-$HOSTNAME
sudo -u ceph ceph-mon --cluster $CLUSTER_NAME --mkfs -i $HOSTNAME --monmap /tmp/monmap --keyring /tmp/ceph.mon.keyring
sudo systemctl start ceph-mon@$HOSTNAME

# Manager Daemon Configuration
sudo mkdir -p /var/lib/ceph/mgr/$CLUSTER_NAME-$HOSTNAME/
sudo ceph auth get-or-create mgr.$HOSTNAME mon 'allow profile mgr' osd 'allow *' mds 'allow *' | sudo tee -a /var/lib/ceph/mgr/$CLUSTER_NAME-$HOSTNAME/keyring
sudo systemctl start ceph-mgr@$HOSTNAME.service

# To remove warnings in "ceph -s"
# Gets rid of "mon is allowing insecure global_id reclaim"
sudo ceph config set mon auth_allow_insecure_global_id_reclaim false
# Gets rid of "1 monitors have not enabled msgr2"
sudo ceph mon enable-msgr2

# Bluestore
sudo ceph-volume lvm create --data $DEVICE

# MDS
sudo mkdir -p /var/lib/ceph/mds/$CLUSTER_NAME-$HOSTNAME
sudo ceph-authtool --create-keyring /var/lib/ceph/mds/$CLUSTER_NAME-$HOSTNAME/keyring --gen-key -n mds.$HOSTNAME
sudo ceph auth add mds.$HOSTNAME osd "allow rwx" mds "allow *" mon "allow profile mds" -i /var/lib/ceph/mds/$CLUSTER_NAME-$HOSTNAME/keyring

cat <<EOF | sudo tee -a /etc/ceph/ceph.conf > /dev/null
[mds.$HOSTNAME]
host = $HOSTNAME
EOF

sudo chown ceph:ceph /var/lib/ceph/mds/$CLUSTER_NAME-$HOSTNAME/keyring

sudo systemctl start ceph-mds@$HOSTNAME.service

# Create the pools
sudo ceph osd pool create cephfs_data
sudo ceph osd pool create cephfs_metadata

# Create the file system
FILE_SYSTEM_NAME=cephfs
sudo ceph fs new $FILE_SYSTEM_NAME cephfs_metadata cephfs_data
sudo ceph osd pool set cephfs_data bulk true

sudo systemctl enable ceph-mon@$HOSTNAME.service ceph-mds@$HOSTNAME.service ceph-mgr@$HOSTNAME.service

# Mount the file system
echo -e "The filesystem is now ready and can be mounted with:\n\
sudo mount -t ceph admin@$FSID.$FILE_SYSTEM_NAME=/ /mnt/mycephfs\n\
\n\
You can also append this to /etc/fstab:\n\
# <file system> <mount point> <type> <options> <dump> <pass>\n\
admin@.$FILE_SYSTEM_NAME=/ /mnt/mycephfs ceph noatime,_netdev 0 0
"
