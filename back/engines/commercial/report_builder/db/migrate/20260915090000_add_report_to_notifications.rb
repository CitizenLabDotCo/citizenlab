# frozen_string_literal: true

class AddReportToNotifications < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  def change
    # The "your report is ready" notification links straight to the report it is
    # about. No index: notifications are only ever read by recipient, never by the
    # report they point at.
    add_column :notifications, :report_id, :uuid
    # Not validated: the column is new, so every row is NULL and there is nothing
    # to check.
    add_foreign_key :notifications, :report_builder_reports, column: :report_id, validate: false
  end
end
