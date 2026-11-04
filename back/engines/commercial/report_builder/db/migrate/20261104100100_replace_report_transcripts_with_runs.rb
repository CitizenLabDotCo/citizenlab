# frozen_string_literal: true

# A report's chat and the messages of its runs move to the AI assistant's conversation
# tables. What stays here is what only a report run has: its kind, cost, why it stopped
# and whether it saved the report.
#
# Dropped rather than converted: no released code ever wrote to these tables, so there
# are no rows to carry over.
class ReplaceReportTranscriptsWithRuns < ActiveRecord::Migration[7.2]
  def change
    drop_table :report_builder_report_chats, id: :uuid do |t|
      t.references(
        :report,
        type: :uuid,
        null: false,
        index: { name: 'index_report_chats_on_report_id', unique: true },
        foreign_key: { to_table: :report_builder_reports, on_delete: :cascade }
      )
      t.jsonb :transcript, null: false, default: []

      t.timestamps
    end

    drop_table :report_builder_generation_transcripts, id: :uuid do |t|
      t.references :report, type: :uuid, null: false, index: true,
        foreign_key: { to_table: :report_builder_reports, on_delete: :cascade }
      t.string :model, null: false, default: ''
      t.string :kind, null: false, default: 'generation'
      t.jsonb :messages, null: false, default: []
      t.jsonb :usage, null: false, default: {}
      t.string :stopped_because
      t.datetime :cancel_requested_at

      t.timestamps
      t.datetime :report_saved_at
    end

    create_table :report_builder_runs, id: :uuid do |t|
      # Indexed: every chat turn reads the report's runs to rebuild its history.
      t.references :conversation, type: :uuid, null: false, index: true,
        foreign_key: { to_table: :ai_assistant_conversations, on_delete: :cascade }
      # generation | revision. A chat turn is a run too.
      t.string :kind, null: false, default: 'generation'
      t.string :model, null: false, default: ''
      t.jsonb :usage, null: false, default: {}
      # done | round_cap | timeout | cancelled | failed. Null while the run is going.
      t.string :stopped_because
      # Set by the cancel endpoint; the loop reads it between rounds.
      t.datetime :cancel_requested_at
      # When this run's work was written to the report. A run can stop for a good
      # reason and still save nothing, which stopped_because cannot tell apart.
      t.datetime :report_saved_at
      # The conversation's messages this run wrote, by position. Null until it writes one.
      t.integer :first_position
      t.integer :last_position

      t.timestamps
    end
  end
end
