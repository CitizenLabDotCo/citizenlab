class AddTaskIdToTaggings < ActiveRecord::Migration[6.0]
  def change
    add_column :tagging_taggings, :task_id, :string
  end
end
