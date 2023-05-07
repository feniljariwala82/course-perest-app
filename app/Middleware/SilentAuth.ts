import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not.
 *
 * The request continues as usual, even when the user is not logged-in.
 */
export default class SilentAuthMiddleware {
  /**
   * Handle request
   */
  public async handle({ auth, view }: HttpContextContract, next: () => Promise<void>) {
    /**
     * Check if user is logged-in or not. If yes, then `ctx.auth.user` will be
     * set to the instance of the currently logged in user.
     */
    await auth.check()

    if (auth.isLoggedIn && auth.user) {
      try {
        const user = await User.query().where('id', auth.user.id).preload('profile').firstOrFail()
        view.share({ profile: user.profile })
      } catch (error) {
        console.error(error)
      }
    }

    await next()
  }
}
