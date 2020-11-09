class AddIdeasOrderToPhasesAndProjects < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :ideas_order, :string, default: nil
    add_column :phases, :ideas_order, :string, default: nil
  end
end
