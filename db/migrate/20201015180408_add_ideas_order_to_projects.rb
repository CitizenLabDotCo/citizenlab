class AddIdeasOrderToProjects < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :ideas_order, :integer, default: 0
  end
end
