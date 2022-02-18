class AddGeometryToAreas < ActiveRecord::Migration[6.1]
  def change
    add_column :areas, :geometry, :geometry, geographic: true
    add_index :areas, :geometry, using: :gist
  end
end
