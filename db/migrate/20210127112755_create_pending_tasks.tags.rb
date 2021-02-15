class CreatePendingTasks < ActiveRecord::Migration[6.0]
  def change
    create_table :tagging_pending_tasks, id: :uuid do |t|
      t.string :nlp_task_id, null: false

      t.timestamps
    end
  end
end
