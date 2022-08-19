# frozen_string_literal: true

# This migration comes from texting (originally 20220308181809)
class CreateTextingCampaigns < ActiveRecord::Migration[6.1]
  def change
    create_table :texting_campaigns, id: :uuid do |t|
      t.string :phone_numbers, array: true, default: [], null: false
      t.text :message, null: false
      t.datetime :sent_at
      t.string :status, null: false

      t.timestamps
    end
  end
end
