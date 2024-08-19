class AddAltTextMultilocToProjectImages < ActiveRecord::Migration[7.0]
  def change
    add_column :project_images, :alt_text_multiloc, :jsonb, default: {}
  end
end
