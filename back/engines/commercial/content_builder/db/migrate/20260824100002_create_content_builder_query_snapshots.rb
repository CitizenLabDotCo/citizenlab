# frozen_string_literal: true

class CreateContentBuilderQuerySnapshots < ActiveRecord::Migration[7.2]
  def change
    create_table :content_builder_query_snapshots, id: :uuid do |t|
      t.references :layout, type: :uuid, null: false, index: false,
        foreign_key: { to_table: :content_builder_layouts, on_delete: :cascade }
      # sha256 of the normalized SQL. The query is the identity: two blocks asking the
      # same question of the same report share one stored answer.
      t.string :query_hash, null: false
      t.text :sql, null: false
      t.jsonb :data, null: false, default: {}
      t.datetime :executed_at, null: false

      t.timestamps
    end

    # Every render of a placed block is a lookup on exactly this pair.
    add_index(
      :content_builder_query_snapshots,
      %i[layout_id query_hash],
      unique: true,
      name: 'index_query_snapshots_on_layout_id_and_query_hash'
    )
  end
end
