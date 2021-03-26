class CreatePollResponses < ActiveRecord::Migration[5.2]
  def change
    create_table :polls_responses, id: :uuid do |t|
      t.uuid :participation_context_id, null: false
      t.string :participation_context_type, null: false
      t.references :user, type: :uuid, index: true

      t.timestamps
      t.index ["participation_context_type", "participation_context_id"], name: "index_poll_responses_on_participation_context"
    end
  end
end
