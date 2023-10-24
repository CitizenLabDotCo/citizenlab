# frozen_string_literal: true

class AddParticipationContextToReports < ActiveRecord::Migration[7.0]
  def change
    add_column :report_builder_reports, :participation_context_type, :string
    add_column :report_builder_reports, :participation_context_id, :uuid

    add_index :report_builder_reports, %i[participation_context_type participation_context_id], name: 'index_report_builder_reports_on_participation_context'

    change_column_null :report_builder_reports, :name, true
  end
end
