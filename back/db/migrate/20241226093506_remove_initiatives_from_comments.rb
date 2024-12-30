class RemoveInitiativesFromComments < ActiveRecord::Migration[7.0]
  def change
    execute <<~SQL.squish
      DELETE FROM comments
      WHERE post_type IS NOT NULL AND post_type != 'Idea';
    SQL
    remove_column :comments, :post_type, :string # TODO: Check if this works
    rename_column :comments, :post_id, :idea_id
    add_foreign_key :comments, :ideas, column: :idea_id

    execute <<~SQL.squish
      DELETE FROM internal_comments
      WHERE post_type IS NOT NULL AND post_type != 'Idea';
    SQL
    remove_column :internal_comments, :post_type, :string
    rename_column :internal_comments, :post_id, :idea_id
    add_foreign_key :internal_comments, :ideas, column: :idea_id
  end
end
