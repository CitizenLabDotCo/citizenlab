# frozen_string_literal: true

class AddIndexToDimensionType < ActiveRecord::Migration[6.1]
  def change
    add_index :analytics_dimension_types, %i[name parent], unique: true
  end
end
