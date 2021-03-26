class RenameNotificationsUser < ActiveRecord::Migration[5.1]
  def change
  	remove_column :notifications, :user_id
  	add_reference :notifications, :initiating_user, foreign_key: {to_table: :users}, type: :uuid, index: true
  end
end
