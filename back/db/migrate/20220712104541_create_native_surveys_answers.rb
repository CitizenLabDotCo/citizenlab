# frozen_string_literal: true

class CreateNativeSurveysAnswers < ActiveRecord::Migration[6.1]
  def change
    create_table :native_surveys_answers, id: :uuid do |t|
      t.references :question, foreign_key: { to_table: :native_surveys_questions }, type: :uuid, null: false
      t.references :response, foreign_key: { to_table: :native_surveys_responses }, type: :uuid, null: false

      t.jsonb :text_multiloc
      t.numeric :number
      t.references :answer_option, foreign_key: { to_table: :native_surveys_answer_options }, null: true, type: :uuid, index: false
      t.jsonb :answer_options

      t.timestamps
    end
  end
end
