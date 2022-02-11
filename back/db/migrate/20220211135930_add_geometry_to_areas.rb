class AddGeometryToAreas < ActiveRecord::Migration[6.1]
  def change
    add_column :areas, :geometry, :jsonb
  end
end
