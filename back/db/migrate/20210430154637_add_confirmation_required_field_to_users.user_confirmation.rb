class AddConfirmationRequiredFieldToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :confirmation_required, :boolean
  end
end
