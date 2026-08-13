# frozen_string_literal: true

# Adds a confirmed-phone-number requirement to permissions, mirroring the
# existing confirmed-email requirement. `require_confirmed_phone_number` defaults
# to false (unlike the email equivalent) because it can only be turned on when
# the `sms` feature is enabled. `confirmed_phone_number_expiry` is added for
# parity with the other expiry columns; it is not used yet.
class AddConfirmedPhoneNumberToPermissions < ActiveRecord::Migration[7.2]
  def change
    add_column :permissions, :require_confirmed_phone_number, :boolean, null: false, default: false
    add_column :permissions, :confirmed_phone_number_expiry, :integer
  end
end
