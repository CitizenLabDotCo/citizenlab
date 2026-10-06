# frozen_string_literal: true

# This migration comes from report_builder (originally 20260930100000)
class CreateReportBuilderGenerationTranscripts < ActiveRecord::Migration[7.2]
  def change
    create_table :report_builder_generation_transcripts, id: :uuid do |t|
      t.references :report, type: :uuid, null: false, index: true,
        foreign_key: { to_table: :report_builder_reports, on_delete: :cascade }
      t.string :model, null: false, default: ''
      # Provider-neutral: role, and the content blocks as they were sent or received.
      t.jsonb :messages, null: false, default: []
      t.jsonb :usage, null: false, default: {}
      # done | round_cap | failed
      t.string :stopped_because, null: false, default: 'done'

      t.timestamps
    end
  end
end
