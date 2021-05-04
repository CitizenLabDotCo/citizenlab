class AddConfirmationRequiredFieldToUsers < ActiveRecord::Migration[6.0]
  def up
    add_column :users, :confirmation_required, :boolean, default: true, null: false
    confirm_active_users
  end

  def down
    remove_column :users, :confirmation_required, :boolean, default: true, null: false
  end

  def confirm_active_users
    active_users = User.active
    user_ids = active_users.reject(&:should_require_confirmation?).map(&:id)

    User.where(id: user_ids).update_all(confirmation_required: false)
  end
end
