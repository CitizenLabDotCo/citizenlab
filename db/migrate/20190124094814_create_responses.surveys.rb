# This migration comes from surveys (originally 20190124093845)
class CreateResponses < ActiveRecord::Migration[5.2]
  def change
    create_table :surveys_responses, id: :uuid do |t|
      t.uuid :participation_context_id, null: false
      t.string :participation_context_type, null: false
      t.string :survey_service, null: false
      t.string :external_survey_id, null: false
      t.string :external_response_id, null: false
      t.references :user, null: true, type: :uuid
      t.timestamp :started_at
      t.timestamp :submitted_at, null: false
      t.jsonb :answers, default: {}

      t.timestamps
      t.index ["participation_context_type", "participation_context_id"], name: "index_surveys_responses_on_participation_context"
      
    end
  end
end
