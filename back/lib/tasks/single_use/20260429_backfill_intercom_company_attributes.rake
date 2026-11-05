# Backfills Intercom company custom attributes (tenantId, tenantName,
# tenantHost, tenantOrganizationType, tenantLifecycleStage) for active tenants
# that have the intercom feature enabled. Runs the production identify_tenant
# path so the Intercom company is either created or updated to match current
# AppConfiguration state.
#
# Usage:
#   # Dry run across all eligible tenants:
#   rake single_use:backfill_intercom_company_attributes
#
#   # Execute for real:
#   rake single_use:backfill_intercom_company_attributes[execute]
#
#   # Limit to a single tenant (host) for staged rollout:
#   rake single_use:backfill_intercom_company_attributes[execute,my-tenant.govocal.com]

namespace :single_use do
  desc 'Backfill Intercom company attributes'
  task :backfill_intercom_company_attributes, %i[execute tenant_host] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'
    tenant_host_filter = args[:tenant_host].presence

    puts "---------- STARTING TASK: Backfill Intercom company attributes ----------\n"
    puts "Mode: #{execute ? 'EXECUTE - Intercom API calls WILL be made' : 'Dry run - read-only'}"
    puts "Tenant filter: #{tenant_host_filter || '(all active tenants with intercom feature on)'}\n\n"

    unless INTERCOM_CLIENT
      puts 'INTERCOM_CLIENT is not configured (no INTERCOM_TOKEN env var). Aborting.'
      next
    end

    reporter = ScriptReporter.new
    sleep_between_tenants = 0.25

    # Returns true when the company already has every CDA we'd write set to
    # the same value — in which case the update is a no-op and we can skip
    # the API call.
    company_already_populated = lambda do |company, desired_attrs|
      current = (company.custom_attributes || {}).transform_keys(&:to_s)
      desired_attrs.all? { |k, v| current[k.to_s] == v }
    end

    Tenant.safe_switch_each do |tenant|
      next if tenant_host_filter && tenant.host != tenant_host_filter

      app_config = AppConfiguration.instance
      next unless app_config.settings('core', 'lifecycle_stage') == 'active'
      next unless app_config.feature_activated?('intercom')

      puts "Processing tenant: #{tenant.host}"
      reporter.add_processed_tenant(tenant)

      service = TrackIntercomService.new
      desired_attrs = service.tenant_attributes(tenant)

      begin
        existing_company = INTERCOM_CLIENT.companies.find(company_id: tenant.id)
        sleep sleep_between_tenants

        if company_already_populated.call(existing_company, desired_attrs)
          puts '  Already populated — skipping'
        else
          puts "  #{execute ? 'Updating' : 'Would update'} company — desired_attrs=#{desired_attrs.inspect}"
          if execute
            service.identify_tenant(tenant)
            reporter.add_change(
              { tenant_host: tenant.host, status: 'pre-backfill' },
              { tenant_host: tenant.host, attributes: desired_attrs },
              context: { action: 'update' }
            )
            sleep sleep_between_tenants
          end
        end
      rescue Intercom::ResourceNotFound
        puts "  #{execute ? 'CREATING' : 'Would CREATE'} company — not found in Intercom"
        if execute
          service.identify_tenant(tenant)
          reporter.add_create(
            'Intercom::Company',
            { tenant_host: tenant.host, attributes: desired_attrs },
            context: { action: 'create' }
          )
          sleep sleep_between_tenants
        end
      rescue StandardError => e
        puts "  ERROR for tenant #{tenant.host}: #{e.class}: #{e.message}"
        reporter.add_error(
          "#{e.class}: #{e.message}",
          context: { tenant: tenant.host }
        )
      end
    end

    reporter.report!('backfill_intercom_company_attributes.json', verbose: true)

    puts "\n---------- FINISHED TASK ----------\n"
  end
end
