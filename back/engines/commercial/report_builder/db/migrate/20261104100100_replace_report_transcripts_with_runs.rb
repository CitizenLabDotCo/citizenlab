# frozen_string_literal: true

# A report's chat and the messages of its runs move to the AI assistant's conversation
# tables, and what only a run has moves to ai_assistant_runs. Nothing about a run is
# particular to a report, so nothing is left here to keep.
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
  end
end
