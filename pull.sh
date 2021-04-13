#!/bin/sh
pwd

echo $1
echo $2

discord.sh --text "\`$(date "+%T.%3N")\` - Pulling $1 $2" --username "GitHub"

cd ../$1

pwd

echo "LOG"

git log -n1 --format=format:"%H"

echo "STATUS"

git status

echo "FETCH"

git fetch

echo "PULL"

git pull origin $2

echo "DONE"
