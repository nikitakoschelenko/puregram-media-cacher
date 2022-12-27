import debug from 'debug'
import {
  CallbackQueryContext,
  MediaSource,
  MediaSourceType,
  MessageContext
} from 'puregram'

import {
  MESSAGE_CONTEXT_METHODS_WITH_MEDIA,
  MESSAGE_PROPS_WITH_MEDIA
} from './constants'
import { MemoryStorage } from './storages'
import { MediaCacherStorageValue } from './storages/storage'
import {
  MediaCacherContext,
  MediaCacherInterface,
  MediaCacherOptions,
  MessageContextMethodsWithMedia,
  Middleware
} from './types'

const $debugger = debug('puregram-media-cacher:media-cacher')

export class MediaCacher {
  protected storage: MediaCacherOptions['storage']

  protected getStorageKey: MediaCacherOptions['getStorageKey']

  constructor(options: Partial<MediaCacherOptions> = {}) {
    this.storage = options.storage || new MemoryStorage()

    this.getStorageKey =
      options.getStorageKey ||
      ((_method, input) => {
        switch (input.type) {
          // we can cache only the path to the file
          case MediaSourceType.Path:
            return input.value

          default:
            return false
        }
      })
  }

  /** Returns the middleware for embedding */
  get middleware(): Middleware<
    (MessageContext | CallbackQueryContext) & MediaCacherContext
  > {
    const { storage, getStorageKey } = this

    return async (context, next) => {
      const message = context.is('message') ? context : context.message
      if (!message) {
        return next()
      }

      context.mediaCacher = {} as MediaCacherInterface

      for (const entity of MESSAGE_CONTEXT_METHODS_WITH_MEDIA) {
        const [method, mediaParam] = entity

        if (!(method in message)) {
          continue
        }

        const debug_method_call = $debugger.extend(method, '/')

        const originalMethod = message[method].bind(message)

        const callOriginalMethod = (...args: any[]) => {
          debug_method_call('Calling original method ›')
          debug_method_call('params: %j', args)

          // @ts-ignore
          return originalMethod(...args)
        }

        const cacheMethod: MessageContext[MessageContextMethodsWithMedia] =
          async (...args: any[]) => {
            const input =
              args[0]?.type && args[0]?.value
                ? args[0]
                : args.find(
                    (arg) => typeof arg === 'object' && mediaParam in arg
                  )?.[mediaParam]

            if (!input) {
              return callOriginalMethod(...args)
            }

            const storageKey = getStorageKey(context, input, method)
            if (!storageKey) {
              return callOriginalMethod(...args)
            }

            const { fileId } = ((await storage.get(storageKey)) ??
              {}) as MediaCacherStorageValue

            if (fileId) {
              return callOriginalMethod(
                ...args.map((arg, index) => {
                  if (typeof arg === 'object') {
                    if (index === 0 && arg.type && arg.value) {
                      return MediaSource.fileId(fileId)
                    }

                    if (mediaParam in arg) {
                      return {
                        ...arg,
                        [mediaParam]: MediaSource.fileId(fileId)
                      }
                    }
                  }

                  return arg
                })
              )
            }

            const response = await callOriginalMethod(...args)
            if (typeof response === 'boolean') {
              return response
            }

            for (const prop of MESSAGE_PROPS_WITH_MEDIA) {
              const media = response[prop]
              if (!media) {
                continue
              }

              let fileId: string | undefined

              // media is PhotoSize[]
              if (Array.isArray(media)) {
                fileId = media.at(-1)?.fileId
              } else {
                fileId = media.fileId
              }

              if (!fileId) {
                continue
              }

              await storage.set(storageKey, {
                fileId
              } as MediaCacherStorageValue)
            }

            return response
          }

        // @ts-ignore
        context.mediaCacher[method] = cacheMethod
      }

      return next()
    }
  }
}
