class AddPublicationStatusToProjects < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :publication_status, :string, null: false, default: 'published'
  end
end
