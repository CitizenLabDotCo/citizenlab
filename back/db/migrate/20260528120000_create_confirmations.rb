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

    # Backfill: every user gets both an EmailConfirmation and a NewEmailConfirmation row.
    # The code/counts/sent_at land in whichever row matches the user's current state:
    #   - has new_email          -> data goes to NewEmailConfirmation
    #   - no new_email           -> data goes to EmailConfirmation
    # Users with no email_confirmation_code get two empty rows.
    safety_assured do
      execute <<~SQL.squish
        INSERT INTO confirmations (
          id, user_id, type, code, code_retry_count, code_reset_count, code_sent_at, created_at, updated_at
        )
        SELECT
          gen_random_uuid(),
          users.id,
          'EmailConfirmation',
          CASE WHEN users.new_email IS NULL THEN users.email_confirmation_code             ELSE NULL END,
          CASE WHEN users.new_email IS NULL THEN users.email_confirmation_retry_count      ELSE 0    END,
          CASE WHEN users.new_email IS NULL THEN users.email_confirmation_code_reset_count ELSE 0    END,
          CASE WHEN users.new_email IS NULL THEN users.email_confirmation_code_sent_at     ELSE NULL END,
          NOW(),
          NOW()
        FROM users
      SQL

      execute <<~SQL.squish
        INSERT INTO confirmations (
          id, user_id, type, code, code_retry_count, code_reset_count, code_sent_at, created_at, updated_at
        )
        SELECT
          gen_random_uuid(),
          users.id,
          'NewEmailConfirmation',
          CASE WHEN users.new_email IS NOT NULL THEN users.email_confirmation_code             ELSE NULL END,
          CASE WHEN users.new_email IS NOT NULL THEN users.email_confirmation_retry_count      ELSE 0    END,
          CASE WHEN users.new_email IS NOT NULL THEN users.email_confirmation_code_reset_count ELSE 0    END,
          CASE WHEN users.new_email IS NOT NULL THEN users.email_confirmation_code_sent_at     ELSE NULL END,
          NOW(),
          NOW()
        FROM users
      SQL
    end

    add_index :confirmations, %i[user_id type], unique: true
  end

  def down
    safety_assured do
      # Pull the code data back from whichever confirmation row has it.
      execute <<~SQL.squish
        UPDATE users
        SET
          email_confirmation_code             = confirmations.code,
          email_confirmation_retry_count      = confirmations.code_retry_count,
          email_confirmation_code_reset_count = confirmations.code_reset_count,
          email_confirmation_code_sent_at     = confirmations.code_sent_at
        FROM confirmations
        WHERE confirmations.user_id = users.id
          AND confirmations.code IS NOT NULL
      SQL
    end

    drop_table :confirmations
  end
end
