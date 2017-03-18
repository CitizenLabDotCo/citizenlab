class CreateJoinTableAreasLabs < ActiveRecord::Migration[5.0]
  def change
    create_join_table :labs, :areas do |t|
      t.index :lab_id
      t.index :area_id
    end
  end
end
