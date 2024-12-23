class AddAltTextMultilocToProjectFoldersImages < ActiveRecord::Migration[7.0]
  def change
    add_column :project_folders_images, :alt_text_multiloc, :jsonb, default: {}
  end
end
