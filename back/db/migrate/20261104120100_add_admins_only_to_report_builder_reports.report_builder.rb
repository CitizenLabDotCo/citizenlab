# frozen_string_literal: true

# This migration comes from report_builder (originally 20261104120000)
class AddAdminsOnlyToReportBuilderReports < ActiveRecord::Migration[7.2]
  def up
    # Set when an admin works on a report with access to data from the whole platform,
    # so its project's moderators cannot open it until an admin shares it.
    add_column :report_builder_reports, :admins_only, :boolean, null: false, default: false

    # Only admins could store a chart answer or run a generation so far, and their
    # queries can read every row, so a report holding either is admins only.
    safety_assured do
      execute <<~SQL.squish
        UPDATE report_builder_reports
        SET admins_only = true
        WHERE id IN (
          SELECT layouts.content_buildable_id
          FROM content_builder_layouts layouts
          JOIN content_builder_query_snapshots snapshots ON snapshots.layout_id = layouts.id
          WHERE layouts.content_buildable_type = 'ReportBuilder::Report'
        )
        OR id IN (SELECT report_id FROM report_builder_generation_transcripts)
      SQL
    end
  end

  def down
    remove_column :report_builder_reports, :admins_only
  end
end
