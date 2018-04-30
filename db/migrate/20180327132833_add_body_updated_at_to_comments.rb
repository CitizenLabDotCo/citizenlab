class AddBodyUpdatedAtToComments < ActiveRecord::Migration[5.1]
  def change
  	add_column :comments, :body_updated_at, :datetime, null: true
  end
end
