class AddChildrenAllowedToAdminPublications < ActiveRecord::Migration[6.0]
  def change
    add_column :admin_publications, :children_allowed, :boolean, default: true, null: false
  end
end
