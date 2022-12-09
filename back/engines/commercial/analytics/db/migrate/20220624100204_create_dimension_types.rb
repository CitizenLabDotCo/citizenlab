# frozen_string_literal: true

class CreateDimensionTypes < ActiveRecord::Migration[6.1]
  def change
    create_table :analytics_dimension_types, id: :uuid do |t|
      t.string :name
      t.string :parent
    end
  end
end
