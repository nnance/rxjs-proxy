'use strict'

const Rx = require('rx')

const httpOkay = 200

function main(sources) {
  return {
    HTTP: sources.HTTP.tap(e => console.log('request to', e.req.url))
  }
}

function makeHttpEffect() {
  const requests_ = new Rx.Subject()
  return {
    writeEffect: model_ => {
      model_.subscribe(e => {
        e.res.writeHead(httpOkay, { 'Content-Type': 'text/plain' })
        e.res.end('Hello World\n')
      })
      return requests_
    },
    serverCallback: (req, res) => {
      requests_.onNext({ req, res })
    },
    readEffect: requests_
  }
}

const httpEffect = makeHttpEffect()
const drivers = {
  HTTP: httpEffect
}

function run(mainFunc, driversObj) {
  const sources = {
    HTTP: drivers.HTTP.readEffect
  }
  const sinks = mainFunc(sources)
  Object.keys(driversObj).forEach(key => {
    drivers[key].writeEffect(sinks[key])
  })
}

run(main, drivers)

const http = require('http')
const hostname = '127.0.0.1'
const port = 1337

http.createServer(httpEffect.serverCallback)
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
  })
