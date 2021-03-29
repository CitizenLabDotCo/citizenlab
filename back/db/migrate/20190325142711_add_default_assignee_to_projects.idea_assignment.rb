# This migration comes from idea_assignment (originally 20190325142711)
class AddDefaultAssigneeToProjects < ActiveRecord::Migration[5.2]
  def change
    return if column_exists? :projects, :default_assignee_id

    add_column :projects, :default_assignee_id, :uuid, null: true
    add_foreign_key :projects, :users, column: :default_assignee_id
  end
end
