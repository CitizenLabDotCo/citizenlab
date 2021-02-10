class CreatePendingTasksIdeas < ActiveRecord::Migration[6.0]
  def change
    create_table :tagging_pending_tasks_ideas, id: :uuid do |t|
      t.references :idea, foreign_key: true, type: :uuid, index: true
      t.references :pending_task, foreign_key: {to_table: :tagging_pending_tasks}, type: :uuid, index: true

      t.timestamps
    end
  end
end
