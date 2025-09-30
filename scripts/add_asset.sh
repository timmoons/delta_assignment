#!/bin/sh

curl http://localhost:3000/assets/add -H 'content-type: application/json' -d '{"id":1,"name":"Bitcoin","shortCode":"BTC","type":"CRYPTO"}'
curl http://localhost:3000/assets/add -H 'content-type: application/json' -d '{"id":2,"name":"Bitcoin Cash","shortCode":"BCH","type":"CRYPTO"}'
curl http://localhost:3000/assets/add -H 'content-type: application/json' -d '{"id":3,"name":"Ethereum","shortCode":"ETH","type":"CRYPTO"}'