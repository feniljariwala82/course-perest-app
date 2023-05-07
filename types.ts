interface CreateUserType {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface UpdateOrCreateProfileType {
  firstName: string
  lastName: string
  userId: number
  avatarUrl?: string
  socialAuth?: string
}

interface CreateOrFindOAuthUserType {
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  socialAuth?: string
}

interface UpdateProfileType {
  id: number
  firstName?: string
  lastName?: string
  password?: string
  storagePrefix?: string
}

interface StorePostType {
  title: string
  description: string
  userId: number
  storagePrefix: string
  tags: string[]
}

interface UpdatePostType {
  id: number
  title?: string
  description?: string
  storagePrefix?: string
  tags: string[]
}
