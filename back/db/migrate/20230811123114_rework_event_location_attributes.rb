# frozen_string_literal: true

class ReworkEventLocationAttributes < ActiveRecord::Migration[7.0]
  def change
    rename_column :events, :location_description, :address_1
    add_column :events, :address_2_multiloc, :jsonb, default: {}, null: false
  end
end
