# frozen_string_literal: true

# This migration comes from content_builder (originally 20260824100001)
class CreateContentBuilderCustomBlockVersions < ActiveRecord::Migration[7.2]
  def change
    create_table :content_builder_custom_block_versions, id: :uuid do |t|
      t.references :custom_block, type: :uuid, null: false, index: true, foreign_key: { to_table: :content_builder_custom_blocks, on_delete: :cascade }
      t.integer :number, null: false
      t.string :sdk_version, null: false, default: 'v1'
      # A version is immutable and always complete: the build runs before the version
      # is written, so there is no state in which a stored version has no bundle.
      t.text :source, null: false
      t.text :bundle, null: false
      t.jsonb :manifest, null: false, default: {}
      t.jsonb :messages, null: false, default: {}
      # The versions of esbuild, TypeScript and the SDK the bundle was built with,
      # so a later toolchain upgrade can tell what needs rebuilding.
      t.jsonb :toolchain, null: false, default: {}
      # The generation run that wrote this version, for provenance. A plain uuid rather
      # than a reference: the run lives in the report_builder engine, which depends on
      # this one, and a foreign key here would point the dependency the other way.
      t.uuid :generation_transcript_id

      t.timestamps
    end

    # A layout pins {block, version}, so resolving a placed block is a lookup on
    # exactly this pair on every render.
    add_index(
      :content_builder_custom_block_versions,
      %i[custom_block_id number],
      unique: true,
      name: 'index_custom_block_versions_on_custom_block_id_and_number'
    )
  end
end
