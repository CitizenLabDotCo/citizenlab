# frozen_string_literal: true

class CreateSalts < ActiveRecord::Migration[6.1]
  def change
    create_table :impact_tracking_salts, id: :uuid do |t|
      t.string 'salt', null: false
      t.timestamps
    end
  end
end
