# frozen_string_literal: true

class CreateNativeSurveysSurveys < ActiveRecord::Migration[6.1]
  def change
    create_table :native_surveys_surveys, id: :uuid do |t|
      t.references :participation_context, null: false, polymorphic: true, index: { unique: true }
      t.jsonb :title_multiloc, default: {}, null: false
      t.jsonb :description_multiloc, default: {}, null: false

      t.timestamps
    end
  end
end
