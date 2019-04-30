class AddChildrenCountToComments < ActiveRecord::Migration[5.2]
  def change
    add_column :comments, :children_count, :integer, null: false, default: 0

    Comment.reset_column_information
    Comment.rebuild!
  end
end
