import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    title: schema.string.optional([rules.maxLength(50)]),
    description: schema.string.optional([rules.maxLength(400)]),
    postImage: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
    tags: schema
      .array([rules.minLength(1), rules.required()])
      .members(schema.string([rules.alpha()])),
  })

  public messages: CustomMessages = {
    'title.maxLength': 'Title can not be longer than 50 characters',

    'description.maxLength': 'Description can not be longer than 400 characters',

    'postImage.file': 'Please provide valid image',
    'postImage.size': 'Image size should not be greater than 2MB',
    'postImage.extnames': 'Image should be jpg or png only',

    'tags.required': 'Tags is required',
    'tags.*.string': 'Each tag should be a valid string',
    'tags.*.alpha': 'Each tag can only contain alphabets with no white space',
  }
}
