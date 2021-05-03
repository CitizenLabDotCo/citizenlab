class AddConfirmationRequiredFieldToUsers < ActiveRecord::Migration[6.0]
  def up
    add_column :users, :confirmation_required, :boolean, default: true, null: false

    active_users = User.active
    users_that_do_not_require_confirmation = active_users.reject(&:should_require_confirmation?)

    users_that_do_not_require_confirmation.each do |user|
      user.update(confirmation_required: false)
    end
  end

  def down
    remove_column :users, :confirmation_required, :boolean, default: true, null: false
  end
end
