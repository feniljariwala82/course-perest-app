import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class AuthController {
  public signup = async ({ view, request, session, response }: HttpContextContract) => {
    switch (request.method()) {
      case 'POST':
        /**
         * Schema definition
         */
        const postSchema = schema.create({
          firstName: schema.string([rules.required(), rules.alpha(), rules.trim()]),
          lastName: schema.string([rules.required(), rules.alpha(), rules.trim()]),
          email: schema.string([rules.required(), rules.email()]),
          password: schema.string([rules.required(), rules.minLength(8)]),
        })

        /**
         * Validate request body against the schema
         */
        const payload = await request.validate({
          schema: postSchema,
          messages: {
            'required': 'The {{ field }} is required',
            'alpha': 'The {{ field }} should contain only alphabets',
            'email.email': 'Please provide valid email',
            'password.minLength': 'Password should be at least 8 characters long',
          },
        })

        try {
          await User.createUser(payload)
          session.flash({ success: 'User created' })
          return response.redirect().back()
        } catch (error) {
          console.error(error)
          session.flash({ error: error.message })
          return response.redirect().back()
        }

      default:
        const html = await view.render('auth/signup')
        return html
    }
  }

  public login = async ({ view, request, auth, session, response }: HttpContextContract) => {
    switch (request.method()) {
      case 'POST':
        /**
         * Schema definition
         */
        const postSchema = schema.create({
          email: schema.string([rules.required(), rules.email(), rules.trim()]),
          password: schema.string([rules.required(), rules.minLength(8), rules.trim()]),
        })

        /**
         * Validate request body against the schema
         */
        const payload = await request.validate({
          schema: postSchema,
          messages: {
            'required': 'The {{ field }} is required',
            'email.email': 'Please provide valid email',
            'password.minLength': 'Password should be at least 8 characters long',
          },
        })

        // login
        try {
          await auth.use('web').attempt(payload.email, payload.password)
          session.flash({ success: 'Logged in' })
          return response.redirect().toRoute('home')
        } catch (error) {
          console.error(error)
          session.flash({ error: error.message })
          return response.redirect().back()
        }

      // GET
      default:
        const html = await view.render('auth/login')
        return html
    }
  }

  public logout = async ({ auth, session, response }: HttpContextContract) => {
    try {
      await auth.use('web').logout()
      session.flash({ success: 'Logged out' })
      return response.redirect().toRoute('AuthController.login')
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().back()
    }
  }

  public googleRedirect = async ({ ally }: HttpContextContract) => {
    return ally.use('google').redirect()
  }

  public googleCallback = async ({ ally, session, response, auth }: HttpContextContract) => {
    const google = ally.use('google')

    /**
     * User has explicitly denied the login request
     */
    if (google.accessDenied()) {
      session.flash({ error: 'Access was denied' })
      return response.redirect().toRoute('login')
    }

    /**
     * Unable to verify the CSRF state
     */
    if (google.stateMisMatch()) {
      session.flash({ error: 'Request expired. Retry again' })
      return response.redirect().toRoute('login')
    }

    /**
     * There was an unknown error during the redirect
     */
    if (google.hasError()) {
      session.flash({ error: google.getError()! })
      return response.redirect().toRoute('login')
    }

    /**
     * Finally, access the user
     */
    const authUser = await google.user()

    try {
      const user = await User.createOrFindOAuthUser({
        email: authUser.email!,
        firstName: authUser.original.given_name,
        lastName: authUser.original.family_name,
        avatarUrl: authUser.avatarUrl ? authUser.avatarUrl : undefined,
        socialAuth: 'google',
      })

      await auth.use('web').login(user)
      session.flash({ success: 'Logged in' })
      return response.redirect().toRoute('home')
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('login')
    }
  }

  public githubRedirect = async ({ ally }: HttpContextContract) => {
    return ally.use('github').redirect()
  }

  public githubCallback = async ({ ally, session, response, auth }: HttpContextContract) => {
    const github = ally.use('github')

    /**
     * User has explicitly denied the login request
     */
    if (github.accessDenied()) {
      session.flash({ error: 'Access was denied' })
      return response.redirect().toRoute('login')
    }

    /**
     * Unable to verify the CSRF state
     */
    if (github.stateMisMatch()) {
      session.flash({ error: 'Request expired. Retry again' })
      return response.redirect().toRoute('login')
    }

    /**
     * There was an unknown error during the redirect
     */
    if (github.hasError()) {
      session.flash({ error: github.getError()! })
      return response.redirect().toRoute('login')
    }

    /**
     * Finally, access the user
     */
    const authUser = await github.user()

    try {
      const user = await User.createOrFindOAuthUser({
        email: authUser.email!,
        firstName: authUser.name.split(' ')[0],
        lastName: authUser.name.split(' ')[1],
        avatarUrl: authUser.avatarUrl ? authUser.avatarUrl : undefined,
        socialAuth: 'github',
      })

      await auth.use('web').login(user)
      session.flash({ success: 'Logged in' })
      return response.redirect().toRoute('home')
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('login')
    }
  }

  public facebookRedirect = async ({ ally }: HttpContextContract) => {
    return ally.use('facebook').redirect()
  }

  public facebookCallback = async ({ ally, session, response, auth }: HttpContextContract) => {
    const facebook = ally.use('facebook')

    /**
     * User has explicitly denied the login request
     */
    if (facebook.accessDenied()) {
      session.flash({ error: 'Access was denied' })
      return response.redirect().toRoute('login')
    }

    /**
     * Unable to verify the CSRF state
     */
    if (facebook.stateMisMatch()) {
      session.flash({ error: 'Request expired. Retry again' })
      return response.redirect().toRoute('login')
    }

    /**
     * There was an unknown error during the redirect
     */
    if (facebook.hasError()) {
      session.flash({ error: facebook.getError()! })
      return response.redirect().toRoute('login')
    }

    /**
     * Finally, access the user
     */
    const authUser = await facebook.user()

    try {
      const user = await User.createOrFindOAuthUser({
        email: authUser.email!,
        firstName: authUser.name.split(' ')[0],
        lastName: authUser.name.split(' ')[1],
        avatarUrl: authUser.avatarUrl ? authUser.avatarUrl : undefined,
        socialAuth: 'facebook',
      })

      await auth.use('web').login(user)
      session.flash({ success: 'Logged in' })
      return response.redirect().toRoute('home')
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('login')
    }
  }
}
