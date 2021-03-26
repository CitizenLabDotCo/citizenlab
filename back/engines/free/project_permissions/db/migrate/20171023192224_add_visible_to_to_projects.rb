class AddVisibleToToProjects < ActiveRecord::Migration[5.1]
  def change
    add_column :projects, :visible_to, :string, null: false, default: 'public'
  end
end
