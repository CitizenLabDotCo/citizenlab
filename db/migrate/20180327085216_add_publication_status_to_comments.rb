class AddPublicationStatusToComments < ActiveRecord::Migration[5.1]
  def change
  	add_column :comments, :publication_status, :string, null: false, default: 'published'
  end
end
