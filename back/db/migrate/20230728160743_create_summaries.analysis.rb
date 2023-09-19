# frozen_string_literal: true

# This migration comes from analysis (originally 20230728175736)
class CreateSummaries < ActiveRecord::Migration[7.0]
  def change
    create_table :analysis_summaries, id: :uuid do |t|
      t.references :analysis, type: :uuid, null: false, index: true, foreign_key: { to_table: :analysis_analyses }
      t.references :background_task, type: :uuid, null: false, index: true, foreign_key: { to_table: :analysis_background_tasks }
      t.text :summary, null: true
      t.text :prompt
      t.string :summarization_method, null: false
      t.jsonb :filters, default: {}, null: false

      t.timestamps
    end
  end
end
