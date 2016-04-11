'use strict'

const Hapi = require('hapi')
const request = require('request')
const Writable = require('stream').Writable

const Rx = require('rx')
const RxNode = require('rx-node')

const host = '127.0.0.1'
const port = 3000

const server = new Hapi.Server()
server.connection({ port, host })

// Create an array of Rx observables
function makeRequests(endpoints) {
  return endpoints.map(path => {
    const httpRequest = request(`http://jsonplaceholder.typicode.com/${path}`)
    return RxNode.fromReadableStream(httpRequest)
  })
}

// process observables
function processResults(requests$) {
  return Rx.Observable.concat(requests$)
}

function apiProxy(endpoints) {
  return (req, reply) => {
    const stream = new Writable()
    const requests$ = makeRequests(endpoints)
    RxNode.writeToStream(processResults(requests$), stream, 'utf-8')
    reply(null, stream)
  }
}

server.route({
  path: '/',
  method: 'GET',
  config: {
    pre: [
      {
        method: apiProxy([ 'users', 'todos', 'posts' ]),
        assign: 'stream'
      }
    ]
  },
  handler: (req, reply) => {
    reply(req.pre.stream)
  }
})

server.start(err => {
  if (err) {
    throw err
  }

  console.log('Server running at:', server.info.uri)
})
