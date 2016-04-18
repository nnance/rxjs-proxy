import { Server } from 'hapi'
import * as request from 'request'
import * as through from 'through2'

import  { Observable } from '@reactivex/rxjs'
const RxNode = require('rx-node')

const host = '127.0.0.1'
const port = 3000

const server = new Server()
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
  return Observable.concat(requests$)
}

function apiProxy(endpoints) {
  return (req, reply) => {
    const requests$ = makeRequests(endpoints)
    const results = processResults(requests$)
    const stream = through()
    RxNode.writeToStream(results, stream, 'utf-8')
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
