# frozen_string_literal: true

class AddSourceToSmsDeliveries < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  def change
    add_reference :sms_deliveries, :source, type: :uuid, polymorphic: true, null: true,
      index: { algorithm: :concurrently }
  end
end
