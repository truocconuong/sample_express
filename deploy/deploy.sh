
set -e

eval $(ssh-agent -s)
echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# ** Alternative approach
# echo -e "$PRIVATE_KEY" > /root/.ssh/id_rsa
# chmod 600 /root/.ssh/id_rsa
# ** End of alternative approach
DEPLOY_SERVERS=$DEPLOY_SERVERS

ALL_SERVERS=(${DEPLOY_SERVERS//,/ })
echo "ALL_SERVERS ${ALL_SERVERS}"


for server in "${ALL_SERVERS[@]}"
do
  echo "deploying to ${server}"
  ssh -o StrictHostKeyChecking=no root@${server} 'bash -s' < ./deploy/updateAndRestart.sh
done
