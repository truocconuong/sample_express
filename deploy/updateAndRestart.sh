#!/bin/bash

# any future command that fails will exit the script
set -e

# Delete the old repo
sudo su

# rm -rf /home/ubuntu/demo_ci_cd/

# clone the repo again
# git clone https://gitlab.com/kitinkhanh/demo_ci_cd.git

#source the nvm file. In an non
#If you are not using nvm, add the actual path like
# PATH=/home/ubuntu/node/bin:$PATH
# source /home/ubuntu/node/bin:$PATH

# stop the previous pm2
# pm2 kill
# npm remove pm2 -g


#pm2 needs to be installed globally as we would be deleting the repo folder.
# this needs to be done only once as a setup script.
# npm install pm2 -g
# starting pm2 daemon
# pm2 status

cd /home/backend-dev

echo "Pull code"
git branch
git pull origin UAT

#install npm packages
echo "Running npm install"
npm install

pm2 restart 11
#Restart the node server
# npm run deploy

pm2 status
