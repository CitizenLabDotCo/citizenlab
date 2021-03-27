class CreateQuestions < ActiveRecord::Migration[5.2]
  def change
    create_table :polls_questions, id: :uuid do |t|
      t.uuid :participation_context_id, null: false
      t.string :participation_context_type, null: false
      t.jsonb :title_multiloc, default: {}, null: false
      t.integer :ordering

      t.timestamps
      t.index ["participation_context_type", "participation_context_id"], name: "index_poll_questions_on_participation_context"
    end
  end
end
