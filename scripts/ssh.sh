linode_ip=`linode-cli linodes list --format ipv4 --text | tail -1`
ssh root@$linode_ip
