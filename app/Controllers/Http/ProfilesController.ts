import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import ProfileUpdateValidator from 'App/Validators/ProfileUpdateValidator'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import path from 'path'
import Database from '@ioc:Adonis/Lucid/Database'
import Env from '@ioc:Adonis/Core/Env'
import Drive from '@ioc:Adonis/Core/Drive'
import ImageReadService from 'App/Services/ImageReadService'

export default class ProfilesController {
  public show = async ({ view, params, response, session }: HttpContextContract) => {
    const { id } = params
    try {
      const fetchedProfile = await Profile.getProfileById(id)

      let posts: any = fetchedProfile.user.posts
      posts = await ImageReadService.readMultipleImages(posts)

      let profileUrl = ''
      if (fetchedProfile.storage_prefix) {
        profileUrl = await Drive.getSignedUrl(fetchedProfile.storage_prefix)
      }

      const html = await view.render('profiles/show', { fetchedProfile, profileUrl, posts })
      return html
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('home')
    }
  }

  public edit = async ({ view, params, session, response, bouncer }: HttpContextContract) => {
    const { id } = params
    try {
      const fetchedProfile = await Profile.getProfileById(id)

      await bouncer.with('ProfilePolicy').authorize('update', fetchedProfile)

      let imgBase64 = ''
      if (fetchedProfile.storage_prefix) {
        imgBase64 = (await Drive.get(fetchedProfile.storage_prefix)).toString('base64')
      }

      const html = await view.render('profiles/edit', { fetchedProfile, imgBase64 })
      return html
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('home')
    }
  }

  public update = async ({
    params,
    session,
    response,
    request,
    auth,
    bouncer,
  }: HttpContextContract) => {
    const { id } = params

    const payload = await request.validate(ProfileUpdateValidator)

    let profile: Profile
    try {
      profile = await Profile.findOrFail(id)
    } catch (error) {
      console.error(error)
      session.flash({ error: 'Profile not found' })
      return response.redirect().toRoute('home')
    }

    try {
      await bouncer.with('ProfilePolicy').authorize('update', profile)
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('home')
    }

    // user directory
    let userDir = auth.user!.id

    let storagePrefix = ''

    let newImageName = ''

    if (payload.postImage) {
      newImageName = `${cuid()}.${payload.postImage.extname}`

      storagePrefix = path.posix.join(userDir.toString(), newImageName)
    }

    const trx = await Database.transaction()

    try {
      await Profile.updateProfile({ id, storagePrefix, ...payload }, trx)

      if (payload.postImage) {
        // uploading new image
        await payload.postImage.moveToDisk(
          userDir.toString(),
          { name: newImageName },
          Env.get('DRIVE_DISK')
        )

        // deleting old image
        if (profile.storage_prefix) {
          await Drive.delete(profile.storage_prefix)
        }
      }

      await trx.commit()
    } catch (error) {
      await trx.rollback()

      // deleting uploaded image in case of query fails or image deletion fails
      const uploaded = await Drive.exists(storagePrefix)
      if (uploaded) {
        await Drive.delete(storagePrefix)
      }

      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('profile.show', { id })
    }

    if (payload.password) {
      session.flash({ success: 'Logged out' })
      return response.redirect().toRoute('logout')
    } else {
      session.flash({ success: 'Profile updated' })
      return response.redirect().toRoute('profile.show', { id })
    }
  }
}
