class AddPhoneNumberToUser < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :phone_number, :string, null: true
  end
end
