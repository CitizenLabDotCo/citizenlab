# frozen_string_literal: true

# This migration comes from content_builder (originally 20220323125359)
class CreateContentBuilderLayouts < ActiveRecord::Migration[6.1]
  def change
    create_table :content_builder_layouts, id: :uuid do |t|
      t.jsonb :craftjs_jsonmultiloc, default: {}
      t.string :content_buildable_type, null: false
      t.uuid :content_buildable_id, null: false
      t.string :code, null: false
      t.boolean :enabled, null: false, default: false

      t.timestamps
    end
    add_index(
      :content_builder_layouts,
      %i[content_buildable_type content_buildable_id code],
      unique: true,
      name: 'index_content_builder_layouts_content_buidable_type_id_code'
    )
  end
end
