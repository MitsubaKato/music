#!/usr/bin/env sh

npm run build

cd dist

git init

git add -A

git commit -m 'Hello'

git push -f git@github.com:MitsubaKato/Mmusic.git master:gh-pages
