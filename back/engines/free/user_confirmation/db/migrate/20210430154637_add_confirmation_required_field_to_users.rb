class AddConfirmationRequiredFieldToUsers < ActiveRecord::Migration[6.0]
  def up
    add_column :users, :confirmation_required, :boolean, default: true, null: false
  end

  def down
    remove_column :users, :confirmation_required, :boolean, default: true, null: false
  end
end
