# frozen_string_literal: true

# Provisions the `analytics_reader` role and its read grants for the reporting
# MCP tools. Apartment runs migrations once per schema, so this backfills every
# existing tenant (and public). New tenants are handled in
# MultiTenancy::TenantService#finalize_creation; scope changes (new reporting
# tables) by `rake mcp_server:reprovision_analytics_reader`.
class ProvisionAnalyticsReaderRole < ActiveRecord::Migration[7.2]
  def up
    McpServer::AnalyticsReaderProvisioner.provision!
  end

  def down
    McpServer::AnalyticsReaderProvisioner.drop_role!
  end
end
