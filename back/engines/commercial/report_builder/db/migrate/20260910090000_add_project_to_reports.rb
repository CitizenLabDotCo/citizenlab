# frozen_string_literal: true

class AddProjectToReports < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  def change
    # Unique: a project has at most one report, the way a phase does. The index is
    # what the "does this project have a report yet" lookup reads.
    add_reference :report_builder_reports, :project, type: :uuid,
      index: { unique: true, algorithm: :concurrently }
    # Not validated: the column is new, so every row is NULL and there is nothing to
    # check, and validating takes a lock this table does not need.
    add_foreign_key :report_builder_reports, :projects, validate: false
  end
end
