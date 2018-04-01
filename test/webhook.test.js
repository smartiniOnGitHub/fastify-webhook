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

const test = require('tap').test
const request = require('request')
const Fastify = require('fastify')

test('default webhook does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    request({
      method: 'POST',
      uri: `http://localhost:${port}/webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('default webhook (but called via GET instead of POST) return a not found error (404) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    request({
      method: 'GET',
      uri: `http://localhost:${port}/webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 404)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 404, error: 'Not Found', message: 'Not found' })

      fastify.close()
    })
  })
})

// TODO: add a test with custom url and a custom handler (maybe a console logger); as input data provide: "{'url': '/custom-webhook', 'handler': myWebhookHandler}" and implement accordingly ... wip

// TODO: add tests on content (in the response) here, when passing some argument in the call, like 'token' ...

// TODO: add at least 1 test per any other plugin handler ...

// TODO: add test with a custom handler ...
