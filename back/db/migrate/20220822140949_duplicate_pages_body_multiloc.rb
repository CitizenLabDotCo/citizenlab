# frozen_string_literal: true

class DuplicatePagesBodyMultiloc < ActiveRecord::Migration[6.1]
  def change
    add_column :static_pages, :top_info_section_multiloc, :jsonb
    execute('UPDATE static_pages SET top_info_section_multiloc = body_multiloc')
  end
end
