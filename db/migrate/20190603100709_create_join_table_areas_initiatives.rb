class CreateJoinTableAreasInitiatives < ActiveRecord::Migration[5.2]
  def change
    create_table :areas_initiatives, id: :uuid do |t|
      t.references :area, foreign_key: true, type: :uuid, index: true
      t.references :initiative, foreign_key: true, type: :uuid, index: true
    end

    add_index :areas_initiatives, [:initiative_id, :area_id], unique: true
  end
end
