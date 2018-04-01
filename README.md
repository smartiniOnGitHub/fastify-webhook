# fastify-webhook
Fastify Plugin to serve webhooks with some default settings.

With this plugin, Fastify will have a route configured for `/webhook` POST requests.


## Usage

```js
const fastify = require('fastify')()

// example without specifying options, returning a default webhook mapped to '/webhook' that only acknowledge the POST request
fastify.register(require('fastify-webhook'))
// or
// TODO: future use ...
// example with custom webhook handler
// fastify.register(require('fastify-webhook') {'handler': myWebhookHandler})
// TODO: future use ...
// example with custom webhook URLs (one or more)
// fastify.register(require('fastify-webhook') {'webhook1': webhookHandler1, 'webhook2': webhookHandler2})

fastify.listen(3000)
// curl -X POST 127.0.0.1:3000/webhook -H 'Content-Type: application/json' -d '{"payload":"test"}' => returning a JSON dump of the given data, and no thrown error
```

## Requirements

Fastify 0.43.0 or later.


## Note

By default the plugin map a default handler on the URI `/webhook` to be called via POST.

The plugin exposes some handlers, for common base operations:
- `acknowledgeWebHookHandler` (default handler) that simply acknowledge the request, and reply with a simple json response
- `echoWebHookHandler` it dumps the given input data, in the json response
but of course for a real world usage you need to specify your own handler function, with arguments '(req, reply)'.


## License

Licensed under [Apache-2.0](./LICENSE).

----
