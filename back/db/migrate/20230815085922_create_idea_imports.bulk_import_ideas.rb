# frozen_string_literal: true

# This migration comes from bulk_import_ideas (originally 20230812072708)
class CreateIdeaImports < ActiveRecord::Migration[7.0]
  def change
    create_table :idea_import_files, id: :uuid do |t|
      t.references :project, foreign_key: true, type: :uuid, index: true, null: true
      t.string :file
      t.string :name
      t.string :import_type
      t.integer :num_pages, default: 0
      t.timestamps
    end
    create_table :idea_imports, id: :uuid do |t|
      t.references :idea, foreign_key: true, type: :uuid, index: true
      t.references :import_user, foreign_key: { to_table: :users }, type: :uuid
      t.references :file, foreign_key: { to_table: :idea_import_files }, type: :uuid
      t.boolean :user_created, :required, default: false
      t.timestamp :approved_at
      t.text :page_range, array: true, default: []
      t.string :locale, :string
      t.timestamps
    end
  end
end
