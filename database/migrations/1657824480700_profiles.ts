import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('first_name', 50).notNullable()
      table.string('last_name', 50).notNullable()
      table.string('full_name').notNullable()
      table.string('storage_prefix').nullable()
      table.string('avatar_url').nullable()
      table
        .enu('social_auth', ['google', 'github', 'facebook', 'local'])
        .notNullable()
        .defaultTo('local')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
