# frozen_string_literal: true

class CreateDimensionTypes < ActiveRecord::Migration[6.1]
  def up
    create_table :analytics_dimension_types, id: :uuid do |t|
      t.string :name
      t.string :parent
    end
  end

  def down
    drop_table :analytics_dimension_types
  end
end
