# frozen_string_literal: true

class CreatePageviews < ActiveRecord::Migration[7.0]
  def change
    create_table :impact_tracking_pageviews, id: :uuid do |t|
      t.references :session, foreign_key: { to_table: :impact_tracking_sessions }, type: :uuid, null: false, index: false
      t.string 'path', null: false
      t.string 'route', null: false
      t.timestamps
    end
  end
end
