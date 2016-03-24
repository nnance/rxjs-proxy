'use strict'

const Rx = require('rx')
const RxNode = require('rx-node')

const http = require('http')
const request = require('request')

const hostname = '127.0.0.1'
const port = 1337
const httpOkay = 200


// Create an array of Rx observables
function makeRequest(endpoints) {
  return endpoints.map(path => RxNode.fromReadableStream(request(`http://jsonplaceholder.typicode.com/${path}`)))
}

// process observables
function processResult(requests$) {
  return Rx.Observable.concat(requests$)
}

function sendHello(req, res) {
  res.writeHead(httpOkay, { 'Content-Type': 'application/json' })
  const requests$ = makeRequest([ 'users', 'todos', 'posts' ])
  RxNode.writeToStream(processResult(requests$), res, 'utf-8')
}

http.createServer(sendHello)
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
  })
