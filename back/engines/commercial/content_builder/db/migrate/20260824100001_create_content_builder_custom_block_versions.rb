# frozen_string_literal: true

class CreateContentBuilderCustomBlockVersions < ActiveRecord::Migration[7.2]
  def change
    create_table :content_builder_custom_block_versions, id: :uuid do |t|
      t.references :custom_block, type: :uuid, null: false, index: true, foreign_key: { to_table: :content_builder_custom_blocks, on_delete: :cascade }
      t.integer :number, null: false
      t.text :source, null: false, default: ''
      t.text :bundle, null: false, default: ''
      t.jsonb :manifest, null: false, default: {}
      t.jsonb :messages, null: false, default: {}
      t.integer :sdk_version, null: false, default: 1
      t.jsonb :toolchain, null: false, default: {}
      # No foreign key: content_builder_custom_block_ai_sessions is created by the next
      # migration, and a version can outlive the session that produced it.
      t.uuid :ai_session_id, null: true

      t.timestamps
    end

    add_index(
      :content_builder_custom_block_versions,
      %i[custom_block_id number],
      unique: true,
      name: 'index_custom_block_versions_on_custom_block_id_and_number'
    )

    # Both tables are created in this PR and are empty when this runs, so the
    # write lock strong_migrations warns about cannot bite.
    safety_assured do
      add_foreign_key(
        :content_builder_custom_blocks,
        :content_builder_custom_block_versions,
        column: :current_version_id,
        on_delete: :nullify
      )
    end
  end
end
