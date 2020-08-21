#!/usr/bin/env sh

cd src

git init

git add *.ts

git commit -m 'update'

git remote add origin https://github.com/Pong420/crud-reducer.git

git push -f origin master:dist

rm -rf src/.git