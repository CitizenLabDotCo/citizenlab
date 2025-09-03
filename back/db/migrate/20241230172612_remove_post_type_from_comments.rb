class RemovePostTypeFromComments < ActiveRecord::Migration[7.0]
  def change
    remove_column :comments, :post_type, :string
  end
end
