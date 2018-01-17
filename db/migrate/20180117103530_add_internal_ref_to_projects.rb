class AddInternalRefToProjects < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :internal_ref, :string, default: nil
  end
end
