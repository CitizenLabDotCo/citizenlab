# frozen_string_literal: true

# This migration comes from report_builder (originally 20260910140000)
class CreateReportBuilderReportChats < ActiveRecord::Migration[7.2]
  def change
    create_table :report_builder_report_chats, id: :uuid do |t|
      # One chat per report: the conversation is the report's history, not a
      # thread the admin starts over each time.
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
  end
end
