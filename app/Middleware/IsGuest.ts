import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IsGuest {
  public async handle({ auth, session, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    await auth.use('web').check()

    if (auth.use('web').isLoggedIn) {
      session.flash({ success: 'Already logged in' })
      return response.redirect().toRoute('home')
    }

    await next()
  }
}
