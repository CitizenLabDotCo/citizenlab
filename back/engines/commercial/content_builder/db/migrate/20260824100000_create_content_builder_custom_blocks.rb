# frozen_string_literal: true

class CreateContentBuilderCustomBlocks < ActiveRecord::Migration[7.2]
  def change
    create_table :content_builder_custom_blocks, id: :uuid do |t|
      t.jsonb :title_multiloc, null: false, default: {}
      t.jsonb :description_multiloc, default: {}
      # draft | published | disabled. Indexed because the public scope filters on it
      # on every citizen-facing render of a page that places a block.
      t.string :status, null: false, default: 'draft', index: true
      t.references :created_by, type: :uuid, null: true, index: true, foreign_key: { to_table: :users, on_delete: :nullify }

      t.timestamps
    end
  end
end
