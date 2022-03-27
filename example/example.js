/*
 * Copyright 2018-2022 the original author or authors.
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

const fastify = require('fastify')()

fastify.register(require('../'))

// example to handle a sample home request to serve a static page, optional here
fastify.get('/', function (request, reply) {
  const path = require('path')
  const scriptRelativeFolder = path.join(__dirname, path.sep)
  const fs = require('fs')
  const stream = fs.createReadStream(path.join(scriptRelativeFolder, 'home.html'))
  reply.type('text/html; charset=utf-8').send(stream)
})

fastify.listen(3000, '127.0.0.1', (err, address) => {
  if (err) throw err
  console.log(`Server listening on '${address}' ...`)
})

fastify.ready(() => {
  const routes = fastify.printRoutes()
  console.log(`Available Routes:\n${routes}`)

  console.log(`To test the webhook, from another terminal, do something like:
  curl http://127.0.0.1:3000/webhook -X POST -H "Content-Type: application/json" -d '{"payload":"test"}'
  Or similar commands with wget ...
  Note that in Windows curl wants to escape json inner string delimiter.
  `)
})
