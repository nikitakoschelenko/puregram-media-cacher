[npm-version-badge]: https://img.shields.io/npm/v/puregram-media-cacher.svg
[npm-license-badge]: https://img.shields.io/npm/l/puregram-media-cacher.svg
[npm-downloads-badge]: https://img.shields.io/npm/dm/puregram-media-cacher.svg
[npm-link]: https://npmjs.com/package/puregram-media-cacher

# puregram-media-cacher
[![NPM][npm-version-badge]][npm-link] [![NPM][npm-license-badge]][npm-link] [![NPM][npm-downloads-badge]][npm-link]

📀 Media cacher for [puregram](https://github.com/nitreojs/puregram)

## What
Every time you send media to Telegram you upload it. Quite often these are static images/videos/etc stored on disk so they can be sent only once and remember the `file_id` which can be sent again without uploading to the Telegram servers. This module will help cache `file_id` for media.

## Installation
```bash
yarn add puregram-media-cacher
```
```bash
npm i puregram-media-cacher
```

## Storage
The default storage is in-memory storage based on the `Map`. You can use a custom storage such as [puregram-redis-storage](https://github.com/ItzNeviKat/puregram-redis-storage) which are compatible with [@puregram/session](https://github.com/nitreojs/puregram/tree/lord/packages/session).

## Debugging
Set the `DEBUG` environment variable to `puregram-media-cacher:*` for debugging.

### Example usage
```js
const { Telegram, MediaSource, InlineKeyboard } = require('puregram')
const { MediaCacher } = require('puregram-media-cacher')

const telegram = Telegram.fromToken(process.env.TELEGRAM_TOKEN)

const mediaCacher = new MediaCacher()

telegram.updates.use(mediaCacher.middleware)

// for TypeScript users: the context is MessageContext & MediaCacherContext
telegram.updates.on('message', (context, next) => {
  if (context.text !== '/cat') {
    return next()
  }
  if (context.isOutbox) return

  return context.mediaCacher.sendPhoto(MediaSource.path('./funny-cat.png'), {
    caption: 'Look at this funny cat!',
    reply_markup: InlineKeyboard.keyboard([
      InlineKeyboard.textButton({
        text: 'I love dogs',
        payload: 'dog'
      })
    ])
  })
})

telegram.updates.on('callback_query', (context, next) => {
  if (context.queryPayload !== 'dog') {
    return next()
  }

  // important: not context.message, because it's getter and can't be modified
  return context.mediaCacher.editMessageMedia(
    {
      type: 'photo',
      media: MediaSource.path('./funny-dog.png'),
      caption: 'Keep the dog, but cats are still better...'
    },
    {
      reply_markup: InlineKeyboard.keyboard([
        InlineKeyboard.textButton({
          text: 'Bring the cat back',
          payload: 'cat'
        })
      ])
    }
  )
})

telegram.updates.on('callback_query', (context, next) => {
  if (context.queryPayload !== 'cat') {
    return next()
  }

  return context.mediaCacher.editMessageMedia(
    {
      type: 'photo',
      media: MediaSource.path('./funny-cat.png'),
      caption: 'Look at this funny cat!'
    },
    {
      reply_markup: InlineKeyboard.keyboard([
        InlineKeyboard.textButton({
          text: 'I love dogs',
          payload: 'dog'
        })
      ])
    }
  )
})

telegram.updates.startPolling().catch(console.error)
```
