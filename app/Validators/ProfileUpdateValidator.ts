import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ProfileUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    firstName: schema.string.optional([rules.alpha(), rules.trim()]),
    lastName: schema.string.optional([rules.alpha(), rules.trim()]),
    password: schema.string.optional([rules.minLength(8), rules.trim()]),
    postImage: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
  })

  public messages: CustomMessages = {
    'firstName.alpha': 'The first name must contain alphabets only',
    'lastName.alpha': 'The last name must contain alphabets only',
    'password.minLength': 'The password must be 8 characters long',
    'postImage.file': 'Please provide valid image',
    'postImage.size': 'Image size should not be greater than 2MB',
    'postImage.extnames': 'Image should be jpg or png only',
  }
}
