class AddPublicationStatusToPages < ActiveRecord::Migration[5.2]
  def change
    add_column :pages, :publication_status, :string, null: false, default: 'published'
  end
end
