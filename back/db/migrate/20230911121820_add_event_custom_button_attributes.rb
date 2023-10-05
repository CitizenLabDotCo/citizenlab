# frozen_string_literal: true

class AddEventCustomButtonAttributes < ActiveRecord::Migration[7.0]
  def change
    add_column :events, :attend_button_multiloc, :jsonb, default: {}, null: false
    add_column :events, :using_url, :string
  end
end
