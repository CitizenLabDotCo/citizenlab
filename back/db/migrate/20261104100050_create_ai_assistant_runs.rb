# frozen_string_literal: true

# One run of the model on a conversation's subject: minutes of paid work behind a
# background job with nobody watching. The report builder's first generation and each
# of its chat turns are runs.
class CreateAIAssistantRuns < ActiveRecord::Migration[7.2]
  def change
    create_table :ai_assistant_runs, id: :uuid do |t|
      # Indexed: every turn reads the conversation's runs to rebuild its history.
      t.references :conversation, type: :uuid, null: false, index: true,
        foreign_key: { to_table: :ai_assistant_conversations, on_delete: :cascade }
      # Why the surface started this run. Its values are the surface's own.
      t.string :kind, null: false, default: ''
      t.string :model, null: false, default: ''
      t.jsonb :usage, null: false, default: {}
      # done | round_cap | timeout | cancelled | failed. Null while the run is going.
      t.string :stopped_because
      # Set by the cancel endpoint; the loop reads it between rounds.
      t.datetime :cancel_requested_at
      # When the work this run produced was written to the subject. A run can stop for
      # a good reason and still have written nothing, which stopped_because cannot
      # tell apart.
      t.datetime :applied_at

      t.timestamps
    end

    # The run that wrote this message. Null for a message no run wrote, which is what
    # a person typed. Indexed: the panel reads the run of every message it shows.
    safety_assured do
      add_reference :ai_assistant_messages, :run, type: :uuid, null: true, index: true,
        foreign_key: { to_table: :ai_assistant_runs, on_delete: :nullify }
    end
  end
end
