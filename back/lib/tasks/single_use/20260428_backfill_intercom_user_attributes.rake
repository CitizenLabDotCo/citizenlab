# Backfills Intercom contact custom attributes (isAdmin, highestRole, etc.)
# for trackable users after the US -> EU Intercom workspace migration, which
# left many existing contacts with empty CDA values.
#
# Reuses TrackIntercomService#identify_user so the production code path runs
# (including the MultiTenancy patch that links the contact to its company).
#
# Usage:
#   # Dry run across all active tenants:
#   rake single_use:backfill_intercom_user_attributes
#
#   # Execute for real:
#   rake single_use:backfill_intercom_user_attributes[execute]
#
#   # Limit to a single tenant (host) for staged rollout:
#   rake single_use:backfill_intercom_user_attributes[execute,my-tenant.govocal.com]

namespace :single_use do
  desc 'Backfill Intercom contact custom attributes after US->EU migration'
  task :backfill_intercom_user_attributes, %i[execute tenant_host] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'
    tenant_host_filter = args[:tenant_host].presence

    puts "---------- STARTING TASK: Backfill Intercom user attributes ----------\n"
    puts "Mode: #{execute ? 'EXECUTE - Intercom API calls WILL be made' : 'Dry run - no API calls'}"
    puts "Tenant filter: #{tenant_host_filter || '(all active tenants with intercom feature on)'}\n\n"

    unless INTERCOM_CLIENT
      puts 'INTERCOM_CLIENT is not configured (no INTERCOM_TOKEN env var). Aborting.'
      next
    end

    reporter = ScriptReporter.new
    # Tune if you hit 429s. Intercom contact-search is more restrictive than
    # the global limit; ~6-10 req/sec is a safe starting point.
    sleep_between_users = 0.15

    # Returns true when the contact already has every CDA we'd write set to
    # the same value — in which case the update is a no-op and we can skip
    # the API call. Stringifies keys on both sides so symbol/string mismatch
    # in Intercom's response shape doesn't trip us up.
    contact_already_populated = lambda do |contact, desired_attrs|
      current = (contact.custom_attributes || {}).transform_keys(&:to_s)
      desired_attrs.all? { |k, v| current[k.to_s] == v }
    end

    Tenant.safe_switch_each do |tenant|
      next if tenant_host_filter && tenant.host != tenant_host_filter

      app_config = AppConfiguration.instance
      next unless app_config.settings['core']['lifecycle_stage'] == 'active'
      next unless app_config.feature_activated?('intercom')

      puts "Processing tenant: #{tenant.host}"
      reporter.add_processed_tenant(tenant)

      service = TrackIntercomService.new
      updated = 0
      created = 0
      already_populated = 0
      skipped = 0
      errored = 0

      User.active.find_each do |user|
        unless service.track_user?(user)
          skipped += 1
          next
        end

        begin
          # Pre-search so we can log update vs create distinctly and skip
          # contacts whose CDAs are already correct. Costs an extra API call
          # per user in execute mode (identify_user re-searches internally),
          # but for a one-off backfill that's fine — and surfaces external_id
          # mismatches that would otherwise silently create duplicates.
          existing_contact = service.send(:search_contact, user)
          sleep sleep_between_users
          desired_attrs = service.user_attributes(user)

          if existing_contact.nil?
            puts "  #{execute ? 'CREATING' : 'Would CREATE'} user #{user.id} (#{user.email}) — no Intercom contact found by external_id"
            if execute
              service.identify_user(user)
              reporter.add_create(
                'Intercom::Contact',
                { user_id: user.id, attributes: desired_attrs },
                context: { tenant: tenant.host, action: 'create' }
              )
              sleep sleep_between_users
            end
            created += 1
          elsif contact_already_populated.call(existing_contact, desired_attrs)
            already_populated += 1
          else
            puts "  #{execute ? 'Updating' : 'Would update'} user #{user.id} (#{user.email}) — highest_role=#{user.highest_role}"
            if execute
              service.identify_user(user)
              reporter.add_change(
                { user_id: user.id, status: 'pre-backfill' },
                { user_id: user.id, attributes: desired_attrs },
                context: { tenant: tenant.host, action: 'update' }
              )
              sleep sleep_between_users
            end
            updated += 1
          end
        rescue StandardError => e
          errored += 1
          puts "  ERROR for user #{user.id}: #{e.class}: #{e.message}"
          reporter.add_error(
            "#{e.class}: #{e.message}",
            context: { tenant: tenant.host, user_id: user.id }
          )
        end
      end

      verb = execute ? '' : 'Would '
      puts "  #{verb}update #{updated}, #{verb}create #{created}, already populated #{already_populated}, skipped #{skipped}, errored #{errored}"
    end

    reporter.report!('backfill_intercom_user_attributes.json', verbose: true)

    puts "\n---------- FINISHED TASK ----------\n"
  end
end
