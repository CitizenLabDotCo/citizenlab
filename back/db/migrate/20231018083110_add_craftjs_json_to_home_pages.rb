# frozen_string_literal: true

class AddCraftjsJsonToHomePages < ActiveRecord::Migration[7.0]
  def change
    create_table :homepage_contents, id: :uuid do |t|
      t.jsonb :craftjs_json, default: {}, null: false

      t.timestamps
    end
  end
end
