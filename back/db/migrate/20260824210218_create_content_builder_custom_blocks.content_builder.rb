# frozen_string_literal: true

# This migration comes from content_builder (originally 20260824100000)
class CreateContentBuilderCustomBlocks < ActiveRecord::Migration[7.2]
  def change
    create_table :content_builder_custom_blocks, id: :uuid do |t|
      t.jsonb :title_multiloc, null: false, default: {}
      t.jsonb :description_multiloc, default: {}
      t.string :status, null: false, default: 'draft', index: true
      t.references :created_by, type: :uuid, null: true, index: true, foreign_key: { to_table: :users, on_delete: :nullify }
      # The foreign key is added by the migration creating content_builder_custom_block_versions,
      # since that table does not exist yet at this point.
      t.uuid :current_version_id, null: true

      t.timestamps
    end
  end
end
