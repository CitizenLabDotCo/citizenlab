# frozen_string_literal: true

# This migration comes from impact_tracking (originally 20220927133822)

class CreatePageviews < ActiveRecord::Migration[7.0]
  def change
    create_table :impact_tracking_pageviews, id: :uuid do |t|
      t.references :impact_tracking_sessions, foreign_key: true, type: :uuid, null: false, index: false
      t.string 'path', null: false
      t.string 'route', null: false
      t.timestamps
    end
  end
end
