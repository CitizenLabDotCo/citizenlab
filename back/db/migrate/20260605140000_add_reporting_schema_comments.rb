# frozen_string_literal: true

# Documents the reporting tables/columns with Postgres comments, so the
# get_reporting_sql_schema MCP tool can surface their semantics. Apartment runs
# migrations once per schema, so this backfills every existing tenant (and public);
# the comments are then captured in structure.sql. New tenants are handled in
# MultiTenancy::TenantService#finalize_creation; re-apply after a scenic view bump
# (which drops VIEW comments) or text edits via `rake mcp_server:reannotate_reporting_schema`.
class AddReportingSchemaComments < ActiveRecord::Migration[7.2]
  def up
    McpServer::ReportingSchemaAnnotator.annotate!
  end

  def down
    McpServer::ReportingSchemaAnnotator.clear!
  end
end
