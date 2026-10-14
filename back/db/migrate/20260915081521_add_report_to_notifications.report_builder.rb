# frozen_string_literal: true

# This migration comes from report_builder (originally 20260915090000)
class AddReportToNotifications < ActiveRecord::Migration[7.2]
  def change
    # The "your report is ready" notification links straight to the report it is
    # about. Indexed because deleting a report looks up its notifications, both in
    # Report#remove_notifications and in the foreign key's own check.
    safety_assured do
      add_reference :notifications, :report, type: :uuid, index: true,
        foreign_key: { to_table: :report_builder_reports }
    end
  end
end
