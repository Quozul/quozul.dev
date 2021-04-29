#!/bin/sh
echo $1
echo $2

cd ../$1

pwd
whoami

git pull origin $2
