class AddAssigneeToIdeas < ActiveRecord::Migration[5.2]
  def change
    add_column :ideas, :assignee_id, :uuid, null: true
    add_foreign_key :ideas, :users, column: :assignee_id
  end
end
