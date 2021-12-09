class RemovePublicationStatusAndProjectIdFromPages < ActiveRecord::Migration[6.1]
  def change
    remove_column :static_pages, :publication_status, :string, default: 'published'
    remove_column :static_pages, :project_id, :uuid
  end
end
