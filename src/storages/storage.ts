// bypass for compatibility with @puregram/session storages
export interface MediaCacherStorage {
  get(key: string): Promise<object | undefined>
  set(key: string, value: object): Promise<boolean>
  delete(key: string): Promise<boolean>
  touch(key: string): Promise<void>
}

export interface MediaCacherStorageValue {
  fileId: string
}
