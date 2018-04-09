# fastify-webhook
Fastify Plugin to serve webhooks with some default settings.

With this plugin, Fastify will have a route configured for `/webhook` POST requests.


## Usage

```js
const fastify = require('fastify')()

// example without specifying options, returning a default webhook mapped to '/webhook' that only acknowledge the POST request
fastify.register(require('fastify-webhook'))
// or
// example with custom webhook url and handler, and secret key
// fastify.register(require('fastify-webhook'), {'url': '/custom-webhook', 'handler': myWebhookHandler, 'secretKey': 'secret key'})
// or
// TODO: future use ...
// example with multiple webhook mappings (URL and handler)
// fastify.register(require('fastify-webhook'), { "disableDefaultWebhook": true, "mappings": [{"url": "/custom-webhook1", "handler": "myWebhookHandler1"}, {"url": "/custom-webhook2", "handler": "myWebhookHandler2"}], "id": 1000000000 })

fastify.listen(3000)
// curl -X POST 127.0.0.1:3000/webhook -H 'Content-Type: application/json' -d '{"payload":"test"}' => returning a JSON dump of the given data, and no thrown error
```

## Requirements

Fastify 0.43.0 or later.


## Note

By default the plugin map a default handler on the URI `/webhook` to be called via POST.

The plugin exposes some handlers, for common base operations (and webhook debug help).
To use one of them , before registering the plugin, you need to get a reference from its `handlers.js` file.
They are:
- `acknowledge` (default handler) that simply acknowledge the request, and reply with a simple json response
- `echo` it dumps the given input data in the (json) response
- `logger` it dumps some info on the request using Fastify logger
but of course for a real world usage you need to specify your own handler function, with arguments '(req, reply)'.


## License

Licensed under [Apache-2.0](./LICENSE).

----
