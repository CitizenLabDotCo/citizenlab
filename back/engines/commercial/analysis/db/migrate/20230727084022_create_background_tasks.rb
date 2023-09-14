# frozen_string_literal: true

class CreateBackgroundTasks < ActiveRecord::Migration[7.0]
  def change
    create_table :analysis_background_tasks, id: :uuid do |t|
      t.references :analysis, type: :uuid, null: false, index: true, foreign_key: { to_table: :analysis_analyses }
      t.string :type, null: false
      t.string :state, null: false
      t.float :progress, null: true
      t.datetime :started_at, null: true
      t.datetime :ended_at, null: true
      t.string :auto_tagging_method, null: true
      t.timestamps
    end
  end
end
