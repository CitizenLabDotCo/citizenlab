class AddPhoneNumberToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :mobile_phone_number, :string
    add_column :users, :mobile_phone_country_code, :string
  end
end
