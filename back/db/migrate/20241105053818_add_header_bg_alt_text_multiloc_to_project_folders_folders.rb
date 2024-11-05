class AddHeaderBgAltTextMultilocToProjectFoldersFolders < ActiveRecord::Migration[7.0]
  def change
    add_column :project_folders_folders, :header_bg_alt_text_multiloc, :jsonb, default: {}
  end
end
