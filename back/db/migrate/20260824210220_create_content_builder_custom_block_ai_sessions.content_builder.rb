# frozen_string_literal: true

# This migration comes from content_builder (originally 20260824100002)
class CreateContentBuilderCustomBlockAISessions < ActiveRecord::Migration[7.2]
  def change
    create_table :content_builder_custom_block_ai_sessions, id: :uuid do |t|
      t.references(
        :custom_block,
        type: :uuid,
        null: false,
        index: { name: 'index_custom_block_ai_sessions_on_custom_block_id' },
        foreign_key: { to_table: :content_builder_custom_blocks, on_delete: :cascade }
      )
      t.references(
        :created_by,
        type: :uuid,
        null: true,
        index: { name: 'index_custom_block_ai_sessions_on_created_by_id' },
        foreign_key: { to_table: :users, on_delete: :nullify }
      )
      t.string :status, null: false, default: 'active'
      t.jsonb :transcript, null: false, default: []

      t.timestamps
    end
  end
end
