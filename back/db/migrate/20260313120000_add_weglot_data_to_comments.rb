# frozen_string_literal: true

class AddWeglotDataToComments < ActiveRecord::Migration[7.2]
  def change
    add_column :comments, :weglot_data, :jsonb, default: {}, null: false
  end
end
