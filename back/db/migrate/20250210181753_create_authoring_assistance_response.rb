class CreateAuthoringAssistanceResponse < ActiveRecord::Migration[7.1]
  def change
    create_table :authoring_assistance_responses, id: :uuid do |t|
      t.references :idea, foreign_key: true, null: false, type: :uuid, index: true
      t.jsonb :prompt_response, default: {}, null: false
      t.string :custom_free_prompt, null: true

      t.timestamps
    end
  end
end
