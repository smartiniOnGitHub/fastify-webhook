/*
 * Copyright 2018-2023 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

const fastify = require('fastify')({
  // enable logger ...
  logger: {
    level: 'info'
  }
})

// handle secret key (fixed) and user token (user-dependent), as a sample
// if the env var SECRET_KEY is defined, it's value is used, otherwise a default value will be used
const webhookSecretKey = process.env.SECRET_KEY || 'my example Secret Key'

function checkSecretKey (request, reply, done) {
  // function that checks the given secret key, if is good or not
  // note that for simplicity the secret key is mandatory here (not checked in input arguments)
  if (request.headers['content-type'] !== 'application/json' || request.body.secretKey !== webhookSecretKey) {
    reply.code(403).type('application/json').send(new Error('Missing or wrong secret key'))
  }
  done()
}

function checkTokenEven (request, reply, done) {
  const stringToken = request.params.token || ''
  // console.log(`chek token: given "${stringToken}", check if it's even`)
  const numToken = parseInt(stringToken)
  // console.log(`chek token: "${stringToken}" is a number, ${typeof numToken === 'number'}`)
  // console.log(`chek token: "${stringToken}" converted into the number ${numToken}`)
  // function that checks if the given token is good or not
  // for example even numbers are ok, odd or negatives not
  // note that for simplicity the user token is mandatory here (not checked in input arguments)
  if (!isNaN(numToken) && numToken > 0 && (numToken % 2 === 0)) {
    // reply.code(200).type('application/json')
    reply.code(200)
  } else {
    reply.code(403).type('application/json').send(new Error('Missing or wrong token'))
  }
  done()
}

const webhookHandlers = require('../src/handlers') // get plugin handlers (but in a relative way), as a sample
const webhookPlugin = require('../') // get the plugin (but in a relative way), as a sample
fastify.register(webhookPlugin, {
  url: '/custom-webhook/:token',
  handler: webhookHandlers.echo,
  // disableWebhook: false, // same as default
  enableGetPlaceholder: true, // as a sample
  secretKey: webhookSecretKey,
  preHandlers: [checkSecretKey, checkTokenEven]
})

// example to handle a sample home request to serve a static page, optional here
fastify.get('/', function (request, reply) {
  const path = require('path')
  const scriptRelativeFolder = path.join(__dirname, path.sep)
  const fs = require('fs')
  const stream = fs.createReadStream(path.join(scriptRelativeFolder, 'home.html'))
  reply.type('text/html; charset=utf-8').send(stream)
})

fastify.listen({ port: 3000, host: '127.0.0.1' }, (err, address) => {
  if (err) throw err
  console.log(`Server listening on '${address}' ...`)
})

fastify.ready(() => {
  const routes = fastify.printRoutes()
  console.log(`Available Routes:\n${routes}`)

  console.log(`To test the webhook, from another terminal, do something like:
  KO (no secret key, no token): curl http://127.0.0.1:3000/custom-webhook/ -X POST -H "Content-Type: application/json" -d '{"payload":"test"}'
  KO (bad secret key, no token): curl http://127.0.0.1:3000/custom-webhook/ -X POST -H "Content-Type: application/json" -d '{"payload":"test", "secretKey":"my bad Secret Key"}'
  KO (good secret key, bad token): curl http://127.0.0.1:3000/custom-webhook/0999 -X POST -H 'Content-Type: application/json' -d '{"payload":"test", "secretKey":"my example Secret Key"}'
  OK (good secret key, good token): curl http://127.0.0.1:3000/custom-webhook/1000 -X POST -H 'Content-Type: application/json' -d '{"payload":"test", "secretKey":"my example Secret Key"}'
  etc ...
  Or similar commands with wget ...
  Note that in Windows curl wants to escape json inner string delimiter.
  `)
})
