# frozen_string_literal: true

# This migration comes from impact_tracking (originally 20220927133822)

class CreateSalts < ActiveRecord::Migration[6.1]
  def change
    create_table :impact_tracking_salts, id: :uuid do |t|
      t.string 'salt'
      t.timestamps
    end
  end
end
