class AddHeaderBgAltTextMultilocToProjects < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :header_bg_alt_text_multiloc, :jsonb, default: {}
  end
end
