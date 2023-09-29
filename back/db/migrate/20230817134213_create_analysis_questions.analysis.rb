# frozen_string_literal: true

# This migration comes from analysis (originally 20230817071241)
class CreateAnalysisQuestions < ActiveRecord::Migration[7.0]
  def change
    create_table :analysis_questions, id: :uuid do |t|
      t.references :background_task, type: :uuid, null: false, index: true, foreign_key: { to_table: :analysis_background_tasks }
      t.text :question
      t.text :answer
      t.text :prompt
      t.string :q_and_a_method, null: false
      t.float :accuracy

      t.timestamps
    end
  end
end
