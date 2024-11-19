class AddAltTextMultilocToSelectedImages < ActiveRecord::Migration[7.0]
  def change
    add_column :event_images, :alt_text_multiloc, :jsonb, default: {}
    add_column :project_images, :alt_text_multiloc, :jsonb, default: {}
  end
end
