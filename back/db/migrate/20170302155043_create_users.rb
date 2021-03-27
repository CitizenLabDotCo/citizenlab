class CreateUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :users, id: :uuid do |t|
      t.string :name
      t.string :email, index: true
      t.string :password_digest
      t.string :slug, index: true
      t.jsonb :services, default: {}
      t.jsonb :demographics, default: {}
      t.jsonb :roles, default: []
      t.string :reset_password_token

      t.timestamps
    end
  end
end
