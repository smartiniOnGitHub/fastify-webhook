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

const webhookHandlers = require('./handlers.js') // get plugin handlers for default handler

function fastifyWebHook (fastify, options, next) {
  const opts = options || {}
  const webhookUrl = opts.url || '/webhook'
  const webhookHandler = opts.handler || webhookHandlers.acknowledge
  const disableDefaultWebhook = opts.disableDefaultWebhook || false
  const webhookSecretKey = opts.secretKey || null

  if (typeof webhookUrl !== 'string') {
    throw new TypeError(`The given url must be a string, instead got a '${typeof webhookUrl}'`)
  }
  if (typeof webhookHandler !== 'function') {
    throw new TypeError(`The given webhook must be a function, instead got a '${typeof webhookHandler}'`)
  }
  if (webhookSecretKey !== null && typeof webhookSecretKey !== 'string') {
    throw new TypeError(`The given secretKey must be a string, instead got a '${typeof webhookSecretKey}'`)
  }

  // execute plugin code
  if (!disableDefaultWebhook) {
    fastify.route({
      method: 'POST',
      url: webhookUrl,
      beforeHandler: [
        function checkSecretKey (req, reply, done) {
          if (webhookSecretKey) {
            if (req.headers['content-type'] !== 'application/json' || req.body.secretKey !== webhookSecretKey) {
              reply.code(403).type('application/json').send(new Error('Missing or wrong secret key'))
            }
          }
          done()
        }
      ],
      handler: webhookHandler
    })
  }

  next()
}

module.exports = fp(fastifyWebHook, {
  fastify: '>=0.43.0',
  name: 'fastify-webhook'
})
