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
const sget = require('simple-get').concat
const Fastify = require('fastify')

test('default webhook (and empty body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('default webhook (and empty body) but called via GET instead of POST, return a not found error (404) and its description', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    sget({
      method: 'GET',
      url: `http://localhost:${port}/webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 404)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 404, error: 'Not Found', message: 'Not found' })

      fastify.close()
    })
  })
})

test('default webhook (and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/webhook`,
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

function consoleLoggerHandler (req, reply) {
  console.log(`Request: MIME Type: "${req.headers['content-type']}", ID: "${req.id}", body: "${req.body}"`)
  // reply.type('application/json').send(req.body)
  reply.type('application/json').send({ statusCode: 200, result: 'success' })
}

test('custom options for webhook and local handler (and empty body) does not return an error, but a good response (200) and some content', (t) => {
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

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('custom options for webhook and local handler (and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
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

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
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

test('custom options for webhook (using plugin logger handler and empty body) does not return an error, but a good response (200) and some content', (t) => {
  // note that this tests is successful even when given an empty body because input content won't be parsed but only logged
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../') // get a reference to the plugin
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.logger
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin logger handler and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../') // get a reference to the plugin
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.logger
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
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

test('custom options for webhook (using plugin echo handler with no mime type and empty body) to ensure it will reply with an error (500) and its description', (t) => {
  // note that this tests is failing because echo handler wants json as input content type, and a valid (non empty) json content
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.echo
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 500, error: 'Internal Server Error', message: 'Missing or wrong input MIME Type: "undefined"' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin echo handler with given but empty mime type and some body content) to ensure it will reply with an error (415) and its description', (t) => {
  // note that this tests is failing because echo handler wants json as input content type, and a valid (non empty) json content
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.echo
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
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

test('custom options for webhook (using plugin echo handler with a wrong mime type, not supported directly by Fastify) to ensure it will reply with an error (415) and its description', (t) => {
  // note that this tests is failing because echo handler wants json as input content type, and a valid (non empty) json content
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.echo
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
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

test('custom options for webhook (using plugin echo handler and input content type but no body) to ensure it will reply with an error (400) and its description', (t) => {
  // note that this tests is failing because echo handler wants json as input content type, and a valid (non empty) json content
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.echo
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      }
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 400)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 400, error: 'Bad Request', message: 'Unexpected end of JSON input' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin echo handler and input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  // note that this tests is successful because echo handler wants json as input content type, and a valid (non empty) json content
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.echo
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = {'payload': 'test'}
    // const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
      // body: sampleData  // good if already in JSON format ...
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), sampleData)

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin acknowledge handler and no input content type and no body content) so no secret key, must return a Forbidden error (403) and its description', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.acknowledge,
    'secretKey': 'my Secret Key'
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`
      // no secret key provided (in the body content)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 403)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong secret key' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin acknowledge handler and input content type and body content) and a wrong secret key, must return a Forbidden error (403) and its description', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.acknowledge,
    'secretKey': 'my Secret Key'
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = {'payload': 'test', 'secretKey': 'a Wrong Key'}

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 403)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong secret key' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin acknowledge handler and input content type and body content) and a secret key, must return a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.acknowledge,
    'secretKey': 'my Secret Key'
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = {'payload': 'test', 'secretKey': 'my Secret Key'}

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
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

test('custom options for webhook (using plugin echo handler and no input content type and no body content) so no secret key, must return a Forbidden error (403) and its description', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.echo,
    'secretKey': 'my Secret Key'
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`
      // no secret key provided (in the body content)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 403)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong secret key' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin echo handler and input content type and body content) and a wrong secret key, must return a Forbidden error (403) and its description', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.echo,
    'secretKey': 'my Secret Key'
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = {'payload': 'test', 'secretKey': 'a Wrong Key'}

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 403)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong secret key' })

      fastify.close()
    })
  })
})

test('custom options for webhook (using plugin echo handler and input content type and body content) and a secret key, must return a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  const webhookHandlers = require('../handlers.js') // get plugin handlers
  const webhookPlugin = require('../')
  fastify.register(webhookPlugin, {
    'url': '/custom-webhook',
    'handler': webhookHandlers.echo,
    'secretKey': 'my Secret Key'
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = {'payload': 'test', 'secretKey': 'my Secret Key'}

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), {'payload': 'test', 'secretKey': 'my Secret Key'})

      fastify.close()
    })
  })
})
