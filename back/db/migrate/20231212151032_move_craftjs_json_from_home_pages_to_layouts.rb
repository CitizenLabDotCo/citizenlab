# frozen_string_literal: true

class MoveCraftjsJsonFromHomePagesToLayouts < ActiveRecord::Migration[7.0]
  def change
    insert_query = <<~SQL.squish
      INSERT INTO content_builder_layouts
        (content_buildable_id, content_buildable_type, code,       enabled, craftjs_json, created_at, updated_at)
      SELECT 
         id,                   'HomePage',             'homepage', true,    craftjs_json, created_at, updated_at
      FROM home_pages;
    SQL
    execute insert_query
  end
end
