import { MessageContextMethodsWithMedia, MessageMediaKeys } from './types'

export const MESSAGE_CONTEXT_METHODS_WITH_MEDIA: [
  MessageContextMethodsWithMedia,
  string
][] = [
  ['sendPhoto', 'photo'],
  ['sendAudio', 'audio'],
  ['sendDocument', 'document'],
  ['sendVideo', 'video'],
  ['sendAnimation', 'animation'],
  ['sendVideoNote', 'video_note'],
  ['sendSticker', 'sticker'],
  ['editMessageMedia', 'media']
]

export const MESSAGE_PROPS_WITH_MEDIA: MessageMediaKeys[] = [
  'photo',
  'audio',
  'document',
  'video',
  'animation',
  'videoNote',
  'sticker'
]
