class AddInviteStatusToUsers < ActiveRecord::Migration[5.1]
  def change
  	add_column :users, :invite_status, :string
  end
end
