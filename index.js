'use strict'

const Rx = require('rx')
const Cycle = require('@cycle/core')
const http = require('http')

const requests_ = new Rx.Subject()
const hostname = '127.0.0.1'
const port = 1337
const httpOkay = 200


function main(sources) {
  return {
    HTTP: sources.HTTP.tap(e => console.log('request to', e.req.url))
  }
}

// function writeEffect(model_) {
//   model_.subscribe(e => {
//     e.res.writeHead(httpOkay, { 'Content-Type': 'text/plain' })
//     e.res.end('Hello World\n')
//   })
//   return requests_
// }

const drivers = {
  HTTP: requests_
  // Response: writeEffect
}

http.createServer((req, res) => requests_.onNext({req, res}))
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
  })

Cycle.run(main, drivers)
