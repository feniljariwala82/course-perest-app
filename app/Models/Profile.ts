import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public first_name: string

  @column()
  public last_name: string

  @column()
  public full_name: string

  @column()
  public storage_prefix: string | null

  @column()
  public avatar_url: string | null

  @column()
  public social_auth: string

  @column()
  public user_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>

  public static updateOrCreateProfile = async (
    data: UpdateOrCreateProfileType,
    trx: TransactionClientContract
  ) => {
    await this.create(
      {
        first_name: data.firstName,
        last_name: data.lastName,
        user_id: data.userId,
        full_name: `${data.firstName} ${data.lastName}`,
      },
      { client: trx }
    )

    return 'Profile created'
  }

  public static getProfileById = async (id: number) => {
    const profile = await this.query()
      .where('id', id)
      .preload('user', (userQuery) => {
        userQuery.preload('posts')
      })
      .firstOrFail()

    return Promise.resolve(profile)
  }

  public static updateProfile = async (data: UpdateProfileType, trx: TransactionClientContract) => {
    const { id, firstName, lastName, password, storagePrefix } = data

    const profile = await this.query({ client: trx }).where('id', id).preload('user').firstOrFail()

    if (password) {
      profile.user.password = password
      profile.social_auth = 'local'
    }

    if (firstName) {
      profile.first_name = firstName
    }

    if (lastName) {
      profile.last_name = lastName
    }

    if (firstName && lastName) {
      profile.full_name = `${firstName} ${lastName}`
    }

    if (storagePrefix) {
      profile.storage_prefix = storagePrefix
      profile.avatar_url = null
    }

    await profile.save()

    return Promise.resolve('Profile updated')
  }
}
