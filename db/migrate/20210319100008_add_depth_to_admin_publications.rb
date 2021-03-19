class AddDepthToAdminPublications < ActiveRecord::Migration[6.0]
  def change
    add_column :admin_publications, :depth, :integer, null: false, default: 0
    add_index :admin_publications, :depth
    AdminPublication.find_each { |admin_publication| admin_publication.send(:set_depth_for_self_and_descendants!) }
  end
end
