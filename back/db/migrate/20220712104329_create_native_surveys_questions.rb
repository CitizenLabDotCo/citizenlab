# frozen_string_literal: true

class CreateNativeSurveysQuestions < ActiveRecord::Migration[6.1]
  def change
    create_table :native_surveys_questions, id: :uuid do |t|
      t.string :type, null: false
      t.jsonb :title_multiloc, default: {}, null: false
      t.references :survey, foreign_key: { to_table: :native_surveys_surveys }, null: false, type: :uuid
      t.integer :ordering, null: false, index: true
      t.jsonb :visibility_condition, null: true
      t.boolean :required, null: false, default: false

      t.timestamps
    end
  end
end
