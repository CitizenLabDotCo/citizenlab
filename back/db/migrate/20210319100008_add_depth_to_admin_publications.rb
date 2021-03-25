class AddDepthToAdminPublications < ActiveRecord::Migration[6.0]
  def change
    add_column :admin_publications, :depth, :integer, null: false, default: 0
    add_index :admin_publications, :depth
  end
end
