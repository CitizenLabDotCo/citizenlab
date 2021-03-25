class AddTimestampsToGroupsProjectsAndMemberships < ActiveRecord::Migration[5.1]
  def change
    change_table(:groups_projects) do |t| 
      t.timestamps
    end
    change_table(:memberships) do |t| 
      t.timestamps
    end
  end
end
