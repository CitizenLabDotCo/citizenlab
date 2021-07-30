class AddLocationGeojsonToEvents < ActiveRecord::Migration[6.0]
  def change
    add_column :events, :location_point, :st_point, geographic: true
  end
end
