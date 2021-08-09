# frozen_string_literal: true

class CreateTextNetworks < ActiveRecord::Migration[6.0]
  def change
    create_table :insights_text_networks, id: :uuid do |t|
      t.references :view, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_views }
      t.string :language, index: true, null: false
      t.jsonb :json_network, null: false

      t.timestamps

      t.index %i[view_id language], unique: true
    end
  end
end
