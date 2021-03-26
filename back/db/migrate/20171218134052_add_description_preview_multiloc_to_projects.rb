class AddDescriptionPreviewMultilocToProjects < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :description_preview_multiloc, :jsonb, default: {}
  end
end
