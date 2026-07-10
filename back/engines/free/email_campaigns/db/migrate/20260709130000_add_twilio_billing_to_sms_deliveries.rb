# Twilio is the source of truth for what a message actually cost. These columns are
# backfilled by Sms::FetchMessageJob once a delivery reaches a terminal status; they are
# null until then. Names mirror Twilio's Message resource.
#
# `price` is signed the way Twilio reports it (negative = charged to the account) and has
# five decimal places, e.g. -0.00750.
class AddTwilioBillingToSmsDeliveries < ActiveRecord::Migration[7.2]
  def change
    add_column :sms_deliveries, :num_segments, :integer
    add_column :sms_deliveries, :price, :decimal, precision: 10, scale: 5
    add_column :sms_deliveries, :price_unit, :string
  end
end
