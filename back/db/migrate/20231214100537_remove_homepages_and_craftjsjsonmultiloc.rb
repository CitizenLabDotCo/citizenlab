# frozen_string_literal: true

class RemoveHomepagesAndCraftjsjsonmultiloc < ActiveRecord::Migration[7.0]
  def change
    remove_column :content_builder_layouts, :craftjs_jsonmultiloc
    change_column_null :content_builder_layouts, :content_buildable_type, true
    change_column_null :content_builder_layouts, :content_buildable_id, true
    execute <<~SQL.squish
      UPDATE content_builder_layouts
      SET content_buildable_id = NULL, content_buildable_type = NULL
      WHERE content_buildable_type = 'HomePage';
    SQL
    drop_table :home_pages
    drop_table :pins
  end
end
