# frozen_string_literal: true

class AddCraftjsJsonToHomePages < ActiveRecord::Migration[7.0]
  def change
    add_column :home_pages, :craftjs_json, :jsonb, default: {}, null: false
  end
end
