class AddChildrenCountAndDepthToComments < ActiveRecord::Migration[5.2]
  def change
    add_column :comments, :depth, :integer, null: false, default: 0
    add_column :comments, :children_count, :integer, null: false, default: 0

    Comment.reset_column_information
    Comment.rebuild!
  end
end
