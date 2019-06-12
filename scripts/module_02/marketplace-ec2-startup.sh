#!/bin/bash
sudo apt-get update
sudo apt-get -y install git
git clone https://github.com/SamSteele01/awsdev-dnd-hbfl.git hbfl
cd hbfl
sudo npm i
sudo npm run start

