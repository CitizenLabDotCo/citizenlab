# frozen_string_literal: true

class CreateConfirmations < ActiveRecord::Migration[7.2]
  def up
    create_table :confirmations, id: :uuid do |t|
      t.references :user, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.string :type, null: false
      t.string :code
      t.integer :code_retry_count, null: false, default: 0
      t.integer :code_reset_count, null: false, default: 0
      t.datetime :code_sent_at
      t.timestamps
    end

    add_index :confirmations, %i[user_id type], unique: true

    execute <<~SQL.squish
      INSERT INTO confirmations (
        id, user_id, type, code, code_retry_count, code_reset_count, code_sent_at, created_at, updated_at
      )
      SELECT
        gen_random_uuid(),
        users.id,
        CASE WHEN users.new_email IS NULL THEN 'EmailConfirmation' ELSE 'NewEmailConfirmation' END,
        users.email_confirmation_code,
        users.email_confirmation_retry_count,
        users.email_confirmation_code_reset_count,
        users.email_confirmation_code_sent_at,
        NOW(),
        NOW()
      FROM users
      WHERE users.email_confirmation_code IS NOT NULL
    SQL

    remove_column :users, :email_confirmation_code
    remove_column :users, :email_confirmation_retry_count
    remove_column :users, :email_confirmation_code_reset_count
    remove_column :users, :email_confirmation_code_sent_at
  end

  def down
    add_column :users, :email_confirmation_code, :string
    add_column :users, :email_confirmation_retry_count, :integer, null: false, default: 0
    add_column :users, :email_confirmation_code_reset_count, :integer, null: false, default: 0
    add_column :users, :email_confirmation_code_sent_at, :datetime

    execute <<~SQL.squish
      UPDATE users
      SET
        email_confirmation_code = confirmations.code,
        email_confirmation_retry_count = confirmations.code_retry_count,
        email_confirmation_code_reset_count = confirmations.code_reset_count,
        email_confirmation_code_sent_at = confirmations.code_sent_at
      FROM confirmations
      WHERE confirmations.user_id = users.id
    SQL

    drop_table :confirmations
  end
end
