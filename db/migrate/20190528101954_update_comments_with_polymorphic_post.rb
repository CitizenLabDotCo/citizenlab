class UpdateCommentsWithPolymorphicPost < ActiveRecord::Migration[5.2]
  def change
    rename_column :comments, :idea_id, :post_id
    remove_foreign_key :ideas, column: :post_id
    add_column :comments, :post_type, :string

    Comment.update_all(post_type: 'Idea')
  end

  add_index :comments, [:post_id, :post_type]
end
