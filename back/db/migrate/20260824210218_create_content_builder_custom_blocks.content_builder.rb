# frozen_string_literal: true

# This migration comes from content_builder (originally 20260824100000)
class CreateContentBuilderCustomBlocks < ActiveRecord::Migration[7.2]
  def change
    create_table :content_builder_custom_blocks, id: :uuid do |t|
      t.jsonb :title_multiloc, null: false, default: {}
      # draft | published | disabled
      t.string :status, null: false, default: 'draft'
      t.references :created_by, type: :uuid, null: true, index: true, foreign_key: { to_table: :users, on_delete: :nullify }

      t.timestamps
    end
  end
end
