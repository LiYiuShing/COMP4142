# COMP4142 Group Project

## Introduction
It built with Node.js With the framework - Express("~4.16.1").

## Prerequisite
Please ensure you have installed the following environments before getting started:

Node
https://nodejs.org/en/

Redis
https://redis.io/topics/quickstart


## Getting Started
!import: You need to open three servers to run the project:

1.  Redis Server
2.  Origin Server
3.  Peer Server

i. Start the Redis server
```
$ redis-server
```

ii. Open a new terminal
```
$ cd comp4142
$ npm install
$ npm run origin
```

iii. Open a new terminal
```
$ cd comp4142
$ npm install
$ npm run peer
```

## User Interface
1. Front-end
2. cURL

### Using Front-end
Browse http://localhost:4000/ to render the origin server in port 4000.
Browse http://localhost:4001/ to render the peer server in port 4001.

### Using RESTful API
You can also using cURL to bypass the front-end:


| Method | Description | Endpoint | Request | Response |
| ------ | ------ | ----- | ----- | ----- | 
| GET   | GET Latest Block | /blockchain/getLatestBlock | NULL | payload |
| GET   | Mine A Block | /blockchain/mineBlock| NULL | payload |
| GET   | Get the wallet balance | /blockchain/balance | NULL | payload |
| GET   | Get the user Address | /blockchain/address | NULL | payload |
| GET   | Get the transactionPool | /blockchain/transactionPool| NULL | payload |
| POST   | Send Transaction| /blockchain/mineBlock| { "address" : "address", "amount": "amount" } | message |

