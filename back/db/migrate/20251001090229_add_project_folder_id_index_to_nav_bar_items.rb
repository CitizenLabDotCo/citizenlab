class AddProjectFolderIdIndexToNavBarItems < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    add_index :nav_bar_items, :project_folder_id, algorithm: :concurrently
  end
end
