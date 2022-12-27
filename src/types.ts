import { Context, MediaInput, MessageContext } from 'puregram'

import { MediaCacherStorage } from './storages'

export type Middleware<T> = (context: T, next: Function) => unknown

export type MessageContextMethodsWithMedia =
  | 'sendPhoto'
  | 'sendAudio'
  | 'sendDocument'
  | 'sendVideo'
  | 'sendAnimation'
  | 'sendVideoNote'
  | 'sendSticker'
  | 'editMessageMedia'

export type MessageMediaKeys =
  | 'animation'
  | 'audio'
  | 'document'
  | 'photo'
  | 'sticker'
  | 'video'
  | 'videoNote'
  | 'voice'

export type MediaCacherInterface = Pick<
  MessageContext,
  MessageContextMethodsWithMedia
>

export type MediaCacherContext = {
  mediaCacher: MediaCacherInterface
}

export interface MediaCacherOptions {
  /** Storage based on FileIdStorage interface */
  storage: MediaCacherStorage

  /** Returns the key for file id storage */
  getStorageKey(
    context: Context,
    input: MediaInput,
    method: string
  ): string | false
}
