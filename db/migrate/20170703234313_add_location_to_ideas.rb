class AddLocationToIdeas < ActiveRecord::Migration[5.1]
  def change
    change_table :ideas do |t|
      t.st_point :location_point, geographic: true
      t.string :location_description
      t.index :location_point, using: :gist
    end
  end
end
