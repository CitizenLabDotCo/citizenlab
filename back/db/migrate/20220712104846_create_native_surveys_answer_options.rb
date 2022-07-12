# frozen_string_literal: true

class CreateNativeSurveysAnswerOptions < ActiveRecord::Migration[6.1]
  def change
    create_table :native_surveys_answer_options, id: :uuid do |t|
      t.jsonb :title_multiloc, default: {}, null: false
      t.references :question, foreign_key: { to_table: :native_surveys_questions }, type: :uuid, null: false
      t.integer :ordering, null: false, index: true

      t.timestamps
    end
  end
end
