class AddChildrenCountToAdminPublications < ActiveRecord::Migration[6.0]
  def change
    add_column :admin_publications, :children_count, :integer, default: 0, null: false
  end
end
