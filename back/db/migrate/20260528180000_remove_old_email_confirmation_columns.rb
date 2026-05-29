# frozen_string_literal: true

class RemoveOldEmailConfirmationColumns < ActiveRecord::Migration[7.2]
  def up
    remove_column :users, :email_confirmation_code, :string
    remove_column :users, :email_confirmation_retry_count, :integer
    remove_column :users, :email_confirmation_code_reset_count, :integer
    remove_column :users, :email_confirmation_code_sent_at, :datetime
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
