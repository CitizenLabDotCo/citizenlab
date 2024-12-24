class AddPublicationStatusIndexToAdminPublications < ActiveRecord::Migration[7.0]
  def change
    add_index :admin_publications, :publication_status
  end
end
