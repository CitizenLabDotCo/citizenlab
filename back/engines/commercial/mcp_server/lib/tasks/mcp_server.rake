# frozen_string_literal: true

namespace :mcp_server do
  desc 'Create/refresh the analytics_reader role and its read grants across all tenants. ' \
       'Re-run after adding tables to GetReportingSqlSchema::REPORTING_TABLES.'
  task reprovision_analytics_reader: :environment do
    McpServer::AnalyticsReaderProvisioner.ensure_role!

    tenant_names = Apartment.tenant_names
    tenant_names.each do |schema|
      McpServer::AnalyticsReaderProvisioner.grant!(schema)
      puts "  granted analytics_reader on #{schema}"
    end

    puts "Done: provisioned #{tenant_names.size} tenant(s)."
  end
end
