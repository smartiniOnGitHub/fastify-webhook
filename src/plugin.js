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

const webhookHandlers = require('./handlers') // get plugin handlers for default handler

function fastifyWebHook (fastify, options, next) {
  const {
    url = '/webhook',
    handler = webhookHandlers.acknowledge,
    disableWebhook = false,
    secretKey = null,
    beforeHandlers = [ checkSecretKey ]
  } = options

  function checkSecretKey (request, reply, done) {
    if (secretKey) {
      const contentType = request.headers['content-type'] || ''
      const requestSecretKey = (request.body) ? request.body.secretKey : ''
      if (request.req.method !== 'POST' ||
        !contentType.startsWith('application/json') ||
        requestSecretKey !== secretKey) {
        reply.code(403).send(new Error('Missing or wrong secret key'))
      }
    }
    done()
  }

  if (typeof url !== 'string') {
    throw new TypeError(`The option url must be a string, instead got a '${typeof url}'`)
  }
  if (typeof handler !== 'function') {
    throw new TypeError(`The option webhook must be a function, instead got a '${typeof handler}'`)
  }
  if (secretKey !== null && typeof secretKey !== 'string') {
    throw new TypeError(`The option secretKey must be a string, instead got a '${typeof secretKey}'`)
  }
  if (beforeHandlers !== null && !Array.isArray(beforeHandlers)) {
    throw new TypeError(`The option beforeHandlers must be an array (of functions), instead got a '${typeof beforeHandlers}'`)
  }

  // execute plugin code
  if (!disableWebhook) {
    fastify.route({
      method: 'POST',
      url,
      beforeHandler: beforeHandlers,
      handler
    })
  }

  next()
}

module.exports = fp(fastifyWebHook, {
  fastify: '^1.1.0',
  name: 'fastify-webhook'
})
