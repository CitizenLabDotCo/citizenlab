# frozen_string_literal: true

class AddDefaultValueToProjectFilterTypeOnStaticPages < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
        execute("UPDATE static_pages SET projects_filter_type = 'no_filter'")
      end
    end

    change_column_default :static_pages, :projects_filter_type, from: nil, to: 'no_filter'
    change_column_null :static_pages, :projects_filter_type, false
  end
end
