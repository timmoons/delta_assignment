#!/bin/sh

curl -s -XPOST http://localhost:3000/assets/search?query=Bi | jq
