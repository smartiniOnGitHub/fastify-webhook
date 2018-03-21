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
// const path = require('path')
// const scriptRelativeFolder = path.join(__dirname, path.sep)

// TODO: fix function arguments, and check if move inside the plugin ... wip

function dumpRequest (req, reply) {
// TODO: implement ... wip
  console.log('test log from dumpRequest ...') // TODO: temp ...
}

function defaultWebHookHandler (req, reply) {
// TODO: implement ... wip
  dumpRequest() // TODO: temp ...
  reply.type('application/json').send({ hello: 'world' }) // TODO: temp ...
}

function defaultWebHookPlugin (fastify, options, next) {
  const opts = options || {}
  const defaultUrl = opts.url || '/webhook'

  fastify.post(defaultUrl, defaultWebHookHandler)
  next()
}

module.exports = fp(defaultWebHookPlugin, {
  fastify: '>=0.43.0',
  name: 'fastify-webhook'
})
