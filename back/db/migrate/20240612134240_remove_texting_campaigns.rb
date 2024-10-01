# frozen_string_literal: true

class RemoveTextingCampaigns < ActiveRecord::Migration[7.0]
  def change
    drop_table :texting_campaigns, id: :uuid do |t|
      t.string :phone_numbers, array: true, default: [], null: false
      t.text :message, null: false
      t.datetime :sent_at
      t.string :status, null: false

      t.timestamps
    end
  end
end
