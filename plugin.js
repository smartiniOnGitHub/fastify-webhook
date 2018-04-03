/*
 * Copyright 2018 the original author or authors.
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

const fp = require('fastify-plugin')

function fastifyWebHook (fastify, options, next) {
  const opts = options || {}
  const handlers = {
    acknowledge: acknowledgeWebHookHandler,
    echo: echoWebHookHandler,
    _default: acknowledgeWebHookHandler
  }
  const defaultUrl = opts.url || '/webhook'
  const defaultHandler = opts.handler || handlers._default
  const disableDefaultWebhook = opts.disableDefaultWebhook || false

  function echoWebHookHandler (req, reply) {
    // return a json dump of given input data
    // TODO: implement it, and maybe add in the response the same attributes like in the acknowledge handler ... wip
    console.log('test log from echoWebHookHandler: request body = ' + req.body) // TODO: temp ...
    reply.type('application/json').send(req.body) // TODO: temp ...
  }

  function acknowledgeWebHookHandler (req, reply) {
    // return a simple acknowledge message
    reply.type('application/json').send({ statusCode: 200, result: 'success' })
  }

  // execute plugin code
  if (!disableDefaultWebhook) {
    fastify.post(defaultUrl, defaultHandler)
  }

  next()
}

module.exports = fp(fastifyWebHook, {
  fastify: '>=0.43.0',
  name: 'fastify-webhook'
})
