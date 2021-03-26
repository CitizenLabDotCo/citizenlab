class AddPresentationModeToProjects < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :presentation_mode, :string, default: 'card', null: false
  end
end
