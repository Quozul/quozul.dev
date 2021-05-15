#!/bin/sh
echo $1
echo $2

cd ../$1

git fetch --all ; git reset --hard origin/$2 ; git pull origin $2
