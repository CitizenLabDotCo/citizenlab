# frozen_string_literal: true

# Renames `de-DE` multiloc keys to `de-AT` across every `_multiloc` attribute
# of every ApplicationRecord model in a single tenant. Also adds `de-AT` to
# the tenant's locales first (if missing) and removes `de-DE` at the end
# (if present), so the tenant ends up using `de-AT` instead of `de-DE`.
#
# What it does:
#   - Targets one tenant, identified by the `host` argument.
#   - Ensures `de-AT` is in the tenant's `core.locales` settings (adds if missing).
#   - For every model with columns ending in `_multiloc`, finds records where
#     the `de-DE` key exists with a value AND `de-AT` is absent or empty,
#     and moves the `de-DE` value to a `de-AT` key (deleting `de-DE`).
#   - Updates every `User` whose `locale` is `'de-DE'` to `'de-AT'`.
#   - Removes `de-DE` from the tenant's `core.locales` settings (if present).
#   - Writes a JSON report with the before/after multiloc values.
#
# What it does NOT do:
#   - It does not translate content - the `de-AT` value is an exact copy of the
#     `de-DE` value.
#   - It does not touch a multiloc that already has a populated `de-AT` value;
#     such cases are caught by the scope filter and left untouched.
#   - It does not walk nested JSON structures (e.g. craftjs_json) - only the
#     top-level multiloc hash on each `_multiloc` column. Nested cases are
#     handled by sibling tasks (see the content builder layout variant).
#   - It uses `update_columns` to bypass validations and callbacks - this is
#     intentional for a locale-key rename that does not change content and may
#     otherwise trip multiloc presence validators during the transition.
#
# Example commands (run from the repo root):
#   Dry run (no changes applied, just reports what would happen):
#     docker compose run --rm web bundle exec rake \
#       single_use:replace_de_DE_with_de_AT[example.com]
#
#   Execute (applies the changes):
#     docker compose run --rm web bundle exec rake \
#       single_use:replace_de_DE_with_de_AT[example.com,execute]

namespace :single_use do
  desc 'For a tenant, rename de-DE multiloc keys to de-AT across every model, and update tenant locales accordingly.'
  task :replace_de_DE_with_de_AT, %i[host execute] => [:environment] do |_t, args|
    host = args[:host]
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Replace de-DE with de-AT ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

    if host.blank?
      puts 'ERROR! No host argument provided. Usage: rake single_use:replace_de_DE_with_de_AT[example.com,execute]'
      next
    end

    tenant = Tenant.find_by(host: host)
    if tenant.nil?
      puts "ERROR! No tenant found for host '#{host}'. Aborting."
      next
    end

    reporter.add_processed_tenant(tenant)

    # Required so ApplicationRecord.descendants returns every model class,
    # including those defined in engines that have not been touched yet.
    Rails.application.eager_load!

    tenant.switch do
      app_config = AppConfiguration.instance
      locales_before = app_config.settings('core', 'locales') || []
      puts "Tenant: #{host} - locales in use (before): #{locales_before.inspect}\n\n"

      # 1) Add de-AT to tenant locales if missing.
      if locales_before.include?('de-AT')
        puts "Tenant locales already include 'de-AT' - no change needed.\n\n"
      else
        puts "#{execute ? 'ADDING' : 'WOULD ADD'} 'de-AT' to tenant locales.\n\n"
        if execute
          settings = app_config.settings
          settings['core']['locales'] = (settings['core']['locales'] || []) + ['de-AT']
          app_config.update!(settings: settings)
        end
      end

      # 2) Walk every concrete model with `_multiloc` columns.
      models = ApplicationRecord.descendants.select do |m|
        !m.abstract_class? && m.table_exists? && m.descends_from_active_record? &&
          m.columns.any? { |c| c.name.end_with?('_multiloc') }
      end
      puts "Found #{models.size} model(s) with `_multiloc` columns.\n\n"

      total_replaced = 0

      models.sort_by(&:name).each do |model|
        multiloc_attrs = model.columns.map(&:name).select { |n| n.end_with?('_multiloc') }

        multiloc_attrs.each do |attr|
          # de-DE key present with a non-null value AND de-AT absent or empty string.
          scope = model
            .where.not("#{attr} -> 'de-DE' IS NULL")
            .where("#{attr} -> 'de-AT' IS NULL OR #{attr} ->> 'de-AT' = ''")

          count = scope.count
          next if count.zero?

          puts "#{model.name}##{attr}: #{count} candidate record(s)"

          scope.find_each do |record|
            before_multiloc = record[attr].deep_dup
            after_multiloc = record[attr].deep_dup
            after_multiloc['de-AT'] = after_multiloc.delete('de-DE')

            context = {
              tenant: host,
              model: model.name,
              record_id: record.id,
              attribute: attr
            }
            reporter.add_change(before_multiloc, after_multiloc, context: context)
            total_replaced += 1
            puts "  #{execute ? 'REPLACED' : 'WOULD REPLACE'} #{model.name} #{record.id} #{attr}"

            next unless execute

            begin
              record.update_columns(attr => after_multiloc)
            rescue StandardError => e
              reporter.add_error(e.message, context: context)
              puts "  ERROR! Failed to update #{model.name} #{record.id} #{attr}: #{e.message}"
            end
          end
        end
      end

      # 2b) Migrate User.locale = 'de-DE' -> 'de-AT'.
      users_scope = User.where(locale: 'de-DE')
      user_count = users_scope.count
      total_users_updated = 0

      if user_count.positive?
        puts "\nUser#locale: #{user_count} user(s) with locale 'de-DE'"
        users_scope.find_each do |user|
          context = { tenant: host, model: 'User', record_id: user.id, attribute: 'locale' }
          reporter.add_change({ 'locale' => 'de-DE' }, { 'locale' => 'de-AT' }, context: context)
          total_users_updated += 1
          puts "  #{execute ? 'REPLACED' : 'WOULD REPLACE'} User #{user.id} locale 'de-DE' -> 'de-AT'"

          next unless execute

          begin
            user.update_columns(locale: 'de-AT')
          rescue StandardError => e
            reporter.add_error(e.message, context: context)
            puts "  ERROR! Failed to update User #{user.id} locale: #{e.message}"
          end
        end
      end

      # 3) Remove de-DE from tenant locales if present.
      app_config.reload
      locales_now = app_config.settings('core', 'locales') || []
      if locales_now.include?('de-DE')
        puts "\n#{execute ? 'REMOVING' : 'WOULD REMOVE'} 'de-DE' from tenant locales."
        if execute
          settings = app_config.settings
          settings['core']['locales'] = settings['core']['locales'] - ['de-DE']
          app_config.update!(settings: settings)
        end
      else
        puts "\nTenant locales do not include 'de-DE' - no removal needed."
      end

      puts "\nFinal tenant locales: #{AppConfiguration.instance.reload.settings('core', 'locales').inspect}" if execute

      puts "\nSummary for tenant #{host}:"
      puts "  Multiloc values #{execute ? 'replaced' : 'to be replaced'}:    #{total_replaced}"
      puts "  User.locale values #{execute ? 'replaced' : 'to be replaced'}: #{total_users_updated}"
    end

    begin
      reporter.report!('replace_de_DE_with_de_AT.json', verbose: false)
      puts "\nReport written to replace_de_DE_with_de_AT.json"
    rescue StandardError => e
      puts "ERROR! Failed to write report: #{e.message}"
    end

    puts "\n---------- FINISHED TASK: Replace de-DE with de-AT ----------\n\n"
  end
end
