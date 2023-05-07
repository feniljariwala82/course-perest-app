import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Post from 'App/Models/Post'
import ImageReadService from 'App/Services/ImageReadService'

export default class TagPost extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public post_id: number

  @column()
  public tag_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Post, {
    localKey: 'id',
    foreignKey: 'post_id',
  })
  public post: BelongsTo<typeof Post>

  public static findRelatedPosts = async (tagIds: number[], postId: number) => {
    const tags = await this.query()
      .whereIn('tag_id', tagIds)
      .andWhereNot('post_id', postId)
      .preload('post')

    let posts = tags.map((item) => item.post)
    posts = [...new Set(posts)]

    const readPosts = await ImageReadService.readMultipleImages(posts)

    return Promise.resolve(readPosts)
  }
}
