# frozen_string_literal: true

class CreatePageProjectsFilterJoinTables < ActiveRecord::Migration[6.1]
  def change
    create_table :static_pages_topics, id: :uuid do |t|
      t.references :topic, index: true, foreign_key: true, type: :uuid, null: false
      t.references :static_page, index: true, foreign_key: true, type: :uuid, null: false

      t.timestamps
    end

    create_table :areas_static_pages do |t|
      t.references :area, index: true, foreign_key: true, type: :uuid, null: false
      t.references :static_page, index: true, foreign_key: true, type: :uuid, null: false

      t.timestamps
    end
  end
end
