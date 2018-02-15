class AddIsInvitedAndInvitedAtToUsers < ActiveRecord::Migration[5.1]
  def change
  	add_column :users, :is_invited, :boolean, null: false, default: false
    add_column :users, :invited_at, :datetime
  end
end
