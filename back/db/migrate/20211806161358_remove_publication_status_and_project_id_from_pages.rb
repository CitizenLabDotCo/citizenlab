class RemovePublicationStatusAndProjectIdFromPages < ActiveRecord::Migration[6.1]
  def change
    remove_column :pages, :publication_status, :string, default: 'published'
    remove_column :pages, :project_id, :uuid
  end
end
