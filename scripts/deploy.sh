function banner {
  echo
  echo $*
  echo
}

function run {
  banner $*
  ssh root@$linode_ip "cd /var/www/open-eyes; time $*"
}

banner getting linode ip
linode_ip=`linode-cli linodes list --format ipv4 --text | tail -1`

run rm -rf /var/www/open-eyes

run forever stopall

banner rsync
time rsync -avCP --exclude=src/server/open-eyes.db .babelrc package*.json webpack.config.js src root@$linode_ip:/var/www/open-eyes/
echo
time rsync -v .env.prod root@$linode_ip:/var/www/open-eyes/.env

run npm ci

run npm run build

run DB=/var/www/open-eyes.db npm run migrate

run NODE_ENV=production PORT=80 DB=/var/www/open-eyes.db forever start src/server/index.js
