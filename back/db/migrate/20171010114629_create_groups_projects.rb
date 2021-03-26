class CreateGroupsProjects < ActiveRecord::Migration[5.1]
  def change
    create_table :groups_projects, id: :uuid do |t|
      t.references :group, foreign_key: true, type: :uuid, index: true
      t.references :project, foreign_key: true, type: :uuid, index: true

      t.index [:group_id, :project_id], unique: true
    end
  end
end
