class AddEmailConfirmationFieldsToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :email_confirmed_at, :datetime
    add_column :users, :email_confirmation_code, :string
    add_column :users, :email_confirmation_retry_count, :integer, null: false, default: 0
    add_column :users, :email_confirmation_code_reset_count, :integer, null: false, default: 0
    add_column :users, :email_confirmation_code_sent_at, :datetime
  end
end
