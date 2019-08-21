class AddAssigneeToInitiatives < ActiveRecord::Migration[5.2]
  def change
    add_column :initiatives, :assignee_id, :uuid, null: true
    add_foreign_key :initiatives, :users, column: :assignee_id
  end
end
