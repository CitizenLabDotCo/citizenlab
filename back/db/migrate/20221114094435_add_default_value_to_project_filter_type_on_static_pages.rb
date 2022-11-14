# frozen_string_literal: true

class AddDefaultValueToProjectFilterTypeOnStaticPages < ActiveRecord::Migration[6.1]
  def change
    execute("UPDATE static_pages SET projects_filter_type = 'none'")
    change_column_default :static_pages, :projects_filter_type, from: nil, to: 'none'
    change_column_null :static_pages, :projects_filter_type, false
  end
end
