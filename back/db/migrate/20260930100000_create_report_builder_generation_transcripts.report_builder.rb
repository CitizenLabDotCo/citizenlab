# frozen_string_literal: true

# This migration comes from report_builder (originally 20260930100000)
class CreateReportBuilderGenerationTranscripts < ActiveRecord::Migration[7.2]
  def change
    create_table :report_builder_generation_transcripts, id: :uuid do |t|
      t.references :report, type: :uuid, null: false, index: true,
        foreign_key: { to_table: :report_builder_reports, on_delete: :cascade }
      t.string :model, null: false, default: ''
      # generation | revision. A chat turn is a run too, and the model-facing history
      # of a report is its runs read back in order.
      t.string :kind, null: false, default: 'generation'
      # Provider-neutral: role, and the content blocks as they were sent or received.
      t.jsonb :messages, null: false, default: []
      t.jsonb :usage, null: false, default: {}
      # done | round_cap | timeout | cancelled | failed. Null while the run is going.
      t.string :stopped_because
      # Set by the cancel endpoint; the loop reads it between rounds.
      t.datetime :cancel_requested_at

      t.timestamps
    end
  end
end
