class CreateJoinTableAreasProjects < ActiveRecord::Migration[5.0]
  def change
    create_table :areas_projects, id: false do |t|
      t.references :area, foreign_key: true, type: :uuid, index: true
      t.references :project, foreign_key: true, type: :uuid, index: true
    end
  end
end
