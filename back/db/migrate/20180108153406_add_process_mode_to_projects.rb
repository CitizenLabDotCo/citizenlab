class AddProcessModeToProjects < ActiveRecord::Migration[5.1]
  def change
    add_column :projects, :process_type, :string, null: false, default: 'timeline'
  end
end
