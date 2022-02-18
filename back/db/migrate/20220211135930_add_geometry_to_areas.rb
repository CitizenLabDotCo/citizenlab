class AddGeometryToAreas < ActiveRecord::Migration[6.1]
  def change
    add_column :areas, :geometry, :geometry
  end
end
