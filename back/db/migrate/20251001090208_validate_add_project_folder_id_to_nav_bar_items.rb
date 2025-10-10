class ValidateAddProjectFolderIdToNavBarItems < ActiveRecord::Migration[7.1]
  def change
    validate_foreign_key :nav_bar_items, :project_folders_folders
  end
end
