# frozen_string_literal: true

class CreateNativeSurveysResponses < ActiveRecord::Migration[6.1]
  def change
    create_table :native_surveys_responses, id: :uuid do |t|
      t.references :survey, foreign_key: { to_table: :native_surveys_surveys }, type: :uuid, null: false, index: false
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.index %i[survey_id user_id], unique: true

      t.timestamp :submitted_at

      t.timestamps
    end
  end
end
