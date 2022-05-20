# frozen_string_literal: true

class CreatePendingTasksTags < ActiveRecord::Migration[6.0]
  def change
    create_table :tagging_pending_tasks_tags, id: :uuid do |t|
      t.references :tag, foreign_key: { to_table: :tagging_tags }, type: :uuid, index: true
      t.references :pending_task, foreign_key: { to_table: :tagging_pending_tasks }, type: :uuid, index: true

      t.timestamps
    end
  end
end
