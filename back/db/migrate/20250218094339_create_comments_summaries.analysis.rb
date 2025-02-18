# This migration comes from analysis (originally 20250218090416)
class CreateCommentsSummaries < ActiveRecord::Migration[7.1]
  def change
    create_table :analysis_comments_summaries, id: :uuid do |t|
      t.references :idea, type: :uuid, index: true, foreign_key: true
      t.references :background_task, type: :uuid, null: false, index: true, foreign_key: { to_table: :analysis_background_tasks }
      t.text :summary, null: true
      t.text :prompt
      t.float :accuracy
      t.datetime :generated_at
      t.jsonb :comments_ids, null: false

      t.timestamps
    end
  end
end
