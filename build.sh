#!/bin/sh

echo Building google-feed-replacement
docker-compose rm --force web
docker-compose build --no-cache --force-rm web

