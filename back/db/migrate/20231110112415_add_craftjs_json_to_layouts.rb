# frozen_string_literal: true

class AddCraftjsJsonToLayouts < ActiveRecord::Migration[7.0]
  def change
    add_column :content_builder_layouts, :craftjs_json, :jsonb, default: {}, null: false
  end
end
