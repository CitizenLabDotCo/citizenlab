class AddRegistrationCompletedAtToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :registration_completed_at, :datetime, null: true

    User.all.each do |u|
      u.update_columns(registration_completed_at: u.created_at)
    end
  end
end
