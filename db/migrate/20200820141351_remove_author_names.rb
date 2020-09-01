class RemoveAuthorNames < ActiveRecord::Migration[6.0]
  def change
    update_view :union_posts, version: 2, revert_to_version: 1

    remove_column :ideas, :author_name, :string
    remove_column :initiatives, :author_name, :string
    remove_column :comments, :author_name, :string
  end
end
