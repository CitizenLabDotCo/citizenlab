class RemoveTaskIdFromTaggings < ActiveRecord::Migration[6.0]
  def change
    remove_column :tagging_taggings, :task_id
  end
end
