class AddInternalRoleToProjects < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :internal_role, :string, default: nil
  end
end
