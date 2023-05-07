import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  BaseModel,
  beforeSave,
  column,
  hasOne,
  HasOne,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import Profile from 'App/Models/Profile'
import { DateTime } from 'luxon'
import Post from 'App/Models/Post'
import ImageReadService from 'App/Services/ImageReadService'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public password: string | null

  @column()
  public remember_me_token: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => Profile, {
    localKey: 'id',
    foreignKey: 'user_id',
  })
  public profile: HasOne<typeof Profile>

  @hasMany(() => Post, {
    foreignKey: 'user_id', // userId
  })
  public posts: HasMany<typeof Post>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password && user.password) {
      user.password = await Hash.make(user.password)
    }
  }

  public static createUser = async (data: CreateUserType) => {
    // 1. create the transaction
    const trx = await Database.transaction()

    // 2. unique email check
    const exists = await this.findBy('email', data.email)
    if (exists) {
      return Promise.reject(new Error('User already exists with this email'))
    }

    try {
      // 3. insertion query for user
      const createdUser = await this.create(
        { email: data.email, password: data.password },
        { client: trx }
      )

      // 4. insertion query for profile
      await Profile.updateOrCreateProfile(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          userId: createdUser.id,
        },
        trx
      )

      // 5. commit the transaction
      await trx.commit()
    } catch (error) {
      await trx.rollback()

      console.error(error)
      return Promise.reject(error)
    }
  }

  public static createOrFindOAuthUser = async (data: CreateOrFindOAuthUserType) => {
    let user = await this.query().where('email', data.email).preload('profile').first()

    if (user) {
      if (user.profile.social_auth !== data.socialAuth) {
        return Promise.reject(new Error('User already exists with this email'))
      }
    } else {
      const trx = await Database.transaction()

      try {
        // create user
        user = await this.create(
          {
            email: data.email,
          },
          { client: trx }
        )

        // create profile
        await Profile.create(
          {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
            user_id: user.id,
            social_auth: data.socialAuth,
            avatar_url: data.avatarUrl,
          },
          { client: trx }
        )

        await trx.commit()
      } catch (error) {
        await trx.rollback()

        console.error(error)
        return Promise.reject(error)
      }
    }

    return Promise.resolve(user)
  }

  public static findPostsByUserId = async (userId: number) => {
    const user = await this.query().where('id', userId).preload('posts').firstOrFail()
    const posts = await ImageReadService.readMultipleImages(user.posts)
    return Promise.resolve(posts)
  }
}
