class AddAccountVerificationFieldsToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :account_verified_at, :datetime
    add_column :users, :account_verification_code, :string
    add_column :users, :account_verification_retry_count, :integer, null: false, default: 0
    add_column :users, :account_verification_code_sent_at, :datetime
  end
end
