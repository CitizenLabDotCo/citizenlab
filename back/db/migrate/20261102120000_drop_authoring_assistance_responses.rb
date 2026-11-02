# frozen_string_literal: true

# The authoring assistance prototype (behind the authoring_assistance_prototype feature
# flag) has been removed. Its activities are deleted too, as their item type no longer
# exists.
class DropAuthoringAssistanceResponses < ActiveRecord::Migration[7.2]
  def up
    safety_assured do
      execute "DELETE FROM activities WHERE item_type = 'AuthoringAssistanceResponse'"
    end

    drop_table :authoring_assistance_responses
  end

  def down
    create_table :authoring_assistance_responses, id: :uuid do |t|
      t.references :idea, foreign_key: true, null: false, type: :uuid, index: true
      t.jsonb :prompt_response, default: {}, null: false
      t.string :custom_free_prompt, null: true

      t.timestamps
    end
  end
end
