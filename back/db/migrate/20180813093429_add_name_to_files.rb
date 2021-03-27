class AddNameToFiles < ActiveRecord::Migration[5.1]
  def change
    add_column :project_files, :name, :string
    add_column :idea_files, :name, :string
    add_column :event_files, :name, :string
    add_column :phase_files, :name, :string
  end
end
