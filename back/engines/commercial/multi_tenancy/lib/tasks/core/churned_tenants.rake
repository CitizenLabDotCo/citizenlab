# frozen_string_literal: true

namespace :churned_tenants do
  desc 'Remove "expired" user PII data from churned tenants'
  task remove_expired_pii: :environment do |_t, _args|
    MultiTenancy::ChurnedTenantService.new.remove_expired_pii
  end

  # Renames through MultiTenancy::TenantService, as Admin HQ does, so the `changed_host`
  # activity reaches cl2-tenant-setup, which sets up DNS for the new host.
  #
  #   rake churned_tenants:move_to_govocal_hosts                     # dry run, all churned tenants
  #   rake 'churned_tenants:move_to_govocal_hosts[execute]'          # rename all churned tenants
  #   rake 'churned_tenants:move_to_govocal_hosts[execute,foo.com]'  # rename one churned tenant
  desc "Move churned tenants not on govocal.com to a govocal.com host. Dry run unless passed 'execute'."
  task :move_to_govocal_hosts, %i[execute host] => [:environment] do |_t, args|
    # rubocop:disable Rails/Output
    execute = args[:execute] == 'execute'
    service = MultiTenancy::ChurnedTenantService.new
    reporter = ScriptReporter.new

    tenants = Tenant.creation_finalized.churned.order(:host)
    tenants = tenants.where(host: args[:host]) if args[:host].present?
    raise ArgumentError, "no churned tenant matches host #{args[:host].inspect}" if args[:host].present? && tenants.empty?

    puts execute ? '🚀 EXECUTE MODE: renaming churned tenants' : '🔍 DRY RUN MODE: no tenant will be renamed'
    puts '=' * 80

    planned_hosts = Set.new
    tenants.each do |tenant|
      reporter.add_processed_tenant(tenant)
      old_host = tenant.host
      new_host = service.govocal_host(old_host)
      next unless new_host

      error = if Tenant.exists?(host: new_host) || planned_hosts.include?(new_host)
        'host already taken on this cluster'
      elsif service.host_resolves?(new_host)
        'host already resolves in DNS (possibly used on another cluster)'
      end
      raise error if error

      planned_hosts << new_host

      if execute
        # Called from the public schema, as the Admin API does, since the rename also renames the
        # tenant's schema.
        success, _tenant, config = MultiTenancy::TenantService.new.update_tenant(tenant, host: new_host)
        raise config.errors.full_messages.to_sentence unless success
      end

      reporter.add_change(old_host, new_host, context: { tenant_id: tenant.id })
      puts "#{execute ? '✅' : '➡️ '} #{old_host} -> #{new_host}"
    rescue StandardError => e
      puts "❌ #{old_host} -> #{new_host || '?'}: #{e.message}"
      reporter.add_error("#{e.class}: #{e.message}", context: { tenant: old_host, new_host: new_host })
    end

    puts '=' * 80
    puts "Churned tenants: #{reporter.tenants.size}"
    puts "#{execute ? 'Renamed' : 'To rename'}: #{reporter.changes.size}"
    puts "Errors: #{reporter.errors.size}"

    report_file = execute ? 'move_to_govocal_hosts.json' : 'move_to_govocal_hosts_dry_run.json'
    reporter.report!(report_file)
    puts "Report: #{report_file}"
    # rubocop:enable Rails/Output
  end
end
