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

function consoleLoggerHandler (req, reply) {
  console.log(`Request MIME Type: "${req.headers['content-type']}"`)
  console.log(`Request ID: "${req.id}"`)
  console.log(`Request body: "${req.body}"`)
  // reply.type('application/json').send(req.body)
  reply.type('application/json').send({ statusCode: 200, result: 'success' })
}

test('custom options for webhook (and empty body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../'), {
    'url': '/custom-webhook',
    'handler': consoleLoggerHandler
  }) // configure this plugin with some custom options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('custom options for webhook (and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../'), {
    'url': '/custom-webhook',
    'handler': consoleLoggerHandler
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`,
      // add some json payload (optional here), and of course all must work even without adding it, see previous test ...
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin loggerWebHookHandler and empty body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookPlugin = require('../') // get a reference to plugin, to be able to use its handlers
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookPlugin.loggerWebHookHandler
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin loggerWebHookHandler and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookPlugin = require('../') // get a reference to plugin, to be able to use its handlers
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookPlugin.loggerWebHookHandler
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`,
      // add some json payload (optional here), and of course all must work even without adding it, see previous test ...
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin echoWebHookHandler and empty body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookPlugin.echoWebHookHandler
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin echoWebHookHandler with empty mime type) to ensure it will reply with an error (415) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookPlugin.echoWebHookHandler
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`,
      headers: {
        'content-type': '' // force an empty mime type
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 415)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), {'statusCode': 415, 'error': 'Unsupported Media Type', 'message': 'Unsupported Media Type: '})

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin echoWebHookHandler with a wrong mime type, not supported directly by Fastify) to ensure it will reply with an error (415) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookPlugin.echoWebHookHandler
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`,
      headers: {
        'content-type': 'application/unknown' // force a mime type not handled directly by Fastify
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 415)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), {'statusCode': 415, 'error': 'Unsupported Media Type', 'message': 'Unsupported Media Type: application/unknown'})

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin echoWebHookHandler and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookPlugin.echoWebHookHandler
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), sampleData)
      // TODO: fix last failing test ... wip
      console.log(`Response body: "${body}"`) // TODO: temp ...

      fastify.close()
    })
  })
})
