class AddConfirmationRequiredFieldToUsers < ActiveRecord::Migration[6.0]
  def up
    add_column :users, :confirmation_required, :boolean, default: true, null: false

    users_that_do_not_require_confirmation = User.all.reject(&:will_require_confirmation?)

    users_that_do_not_require_confirmation.each do |user|
      user.update(confirmation_required: false)
    end
  end

  def down
    remove_column :users, :confirmation_required, :boolean, default: true, null: false
  end
end
