class AddCommentsCountToProjects < ActiveRecord::Migration[5.2]
  def change
    add_column :projects, :comments_count, :integer, null: false, default: 0
  end
end
