'use strict'

const Rx = require('rx')
const RxNode = require('rx-node')

const http = require('http')
const request = require('request')

const hostname = '127.0.0.1'
const port = 3000
const httpOkay = 200


// Create an array of Rx observables
function makeRequests(endpoints) {
  return endpoints.map(path => {
    const httpRequest = request(`http://jsonplaceholder.typicode.com/${path}`)
    return RxNode.fromReadableStream(httpRequest)
  })
}

// process observables
function processResult(requests$) {
  return Rx.Observable.concat(requests$)
}

function handleRequest(req, res) {
  res.writeHead(httpOkay, { 'Content-Type': 'application/json' })
  const requests$ = makeRequests([ 'users', 'todos', 'posts' ])
  RxNode.writeToStream(processResult(requests$), res, 'utf-8')
}

function logServerStatus() {
  console.log(`Server running at http://${hostname}:${port}/`)
}

http
  .createServer(handleRequest)
  .listen(port, hostname, logServerStatus)
