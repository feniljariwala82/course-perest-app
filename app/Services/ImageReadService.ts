import Post from 'App/Models/Post'
import Drive from '@ioc:Adonis/Core/Drive'

class ImageReadService {
  public static readMultipleImages = async (posts: Post[]) => {
    for (const post of posts) {
      const url = await this.getSignedUrl(post.storage_prefix)
      post.$extras.url = url
    }
    return Promise.resolve(posts)
  }

  public static readSingleImage = async (post: Post) => {
    const url = await this.getSignedUrl(post.storage_prefix)
    post.$extras.url = url
    return Promise.resolve(post)
  }

  public static getSignedUrl = async (storagePrefix: string) => {
    // With expiry
    const url = await Drive.getSignedUrl(storagePrefix, {
      expiresIn: '10mins',
    })
    return Promise.resolve(url)
  }
}

export default ImageReadService
