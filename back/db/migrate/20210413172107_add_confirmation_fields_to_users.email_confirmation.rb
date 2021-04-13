class AddConfirmationFieldsToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :confirmed_at, :datetime
    add_column :users, :confirmation_code, :string
    add_column :users, :confirmation_retry_count, :integer, null: false, default: 0
    add_column :users, :confirmation_code_sent_at, :datetime
  end
end
