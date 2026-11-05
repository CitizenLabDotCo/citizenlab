# frozen_string_literal: true

# Converts a single tenant from `de-DE` to `de-AT` in a single pass: adds
# `de-AT` to the tenant locales, rewrites every `de-DE` multiloc key (top-level
# or nested) to `de-AT`, migrates each `User.locale = 'de-DE'` to `'de-AT'`,
# and finally removes `de-DE` from the tenant locales.
#
# What it does:
#   - Targets one tenant, identified by the `host` argument.
#   - Ensures `de-AT` is in the tenant's `core.locales` settings (adds if missing).
#   - For every JSONB column on every ApplicationRecord model, recursively
#     walks the value and, for every hash where `de-DE` is a key AND `de-AT`
#     is absent or empty, moves the `de-DE` value to a `de-AT` key (deleting
#     `de-DE`). This catches both top-level multiloc columns (e.g.
#     `title_multiloc`) and nested multilocs embedded in larger JSON blobs
#     (e.g. `ContentBuilder::Layout#craftjs_json`).
#   - Updates every `User` whose `locale` is `'de-DE'` to `'de-AT'`.
#   - Removes `de-DE` from the tenant's `core.locales` settings (if present).
#   - Writes a JSON report with the before/after JSON values and the paths
#     that were rewritten.
#
# What it does NOT do:
#   - It does not check for the presence of `de-DE` in the tenant locales before
#     starting, as this task is designed to also fix cases where `de-DE` has
#     been mistakenly removed before running this task. A warning is printed.
#   - It does not translate content - the `de-AT` value is an exact copy of the
#     `de-DE` value.
#   - It does not touch a multiloc that already has a populated `de-AT` value
#     at the same path; such cases are reported as skipped and the `de-DE`
#     entry is left in place there.
#   - It uses `update_columns` to bypass validations and callbacks - this is
#     intentional for a locale-key rename that does not change content and may
#     otherwise trip multiloc presence validators during the transition.
#
# Example commands (run from the repo root):
#   Dry run (no changes applied, just reports what would happen):
#     docker compose run --rm web bundle exec rake \
#       cl2back:replace_de_DE_with_de_AT[example.com]
#
#   Execute (applies the changes):
#     docker compose run --rm web bundle exec rake \
#       cl2back:replace_de_DE_with_de_AT[example.com,execute]

namespace :cl2back do
  desc 'For a tenant, rename de-DE multiloc keys to de-AT across every model, and update tenant locales accordingly.'
  task :replace_de_DE_with_de_AT, %i[host execute] => [:environment] do |_t, args|
    host = args[:host]
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Replace de-DE with de-AT ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

    if host.blank?
      puts 'ERROR! No host argument provided. Usage: rake cl2back:replace_de_DE_with_de_AT[example.com,execute]'
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

      # Loud announcement. We cannot abort here, however, as we want to use this to fix case where
      # de-DE locale has ben mistakenly removed before running this task.
      puts "NO de-DE LOCALE FOUND IN TENANT LOCALES!.\n\n" unless locales_before.include?('de-DE')

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

      # 2) Walk every JSONB column on every concrete model. The walker finds
      # `de-DE` hash keys at any nesting depth and rewrites them to `de-AT`
      # (when `de-AT` is absent or empty at that path).
      # View-backed models (e.g. Moderation::Moderation) cannot be written to;
      # they project from underlying tables that this task already updates.
      # Audit-log models (Activity) are skipped: their payloads capture what
      # values existed at a past point in time, so retroactively rewriting
      # them would falsify history.
      view_table_names = ApplicationRecord.connection.views.to_set
      skipped_model_names = %w[Activity].to_set
      models = ApplicationRecord.descendants.select do |m|
        !m.abstract_class? && m.table_exists? && m.descends_from_active_record? &&
          view_table_names.exclude?(m.table_name) &&
          skipped_model_names.exclude?(m.name) &&
          m.columns.any? { |c| c.type == :jsonb }
      end
      puts "Found #{models.size} model(s) with JSONB columns.\n\n"

      total_replaced = 0
      total_skipped = 0

      models.sort_by(&:name).each do |model|
        json_columns = model.columns.select { |c| c.type == :jsonb }

        json_columns.each do |column|
          attr = column.name
          # Cheap text pre-filter: only load records whose JSON serialization
          # contains the literal "de-DE" anywhere. The walker then verifies
          # whether each occurrence is a real hash key.
          scope = model.where("#{attr}::text LIKE ?", '%"de-DE"%')
          # Apartment-excluded models (e.g. Tenant) live in the public schema
          # and ignore tenant.switch, so we must constrain them to the target
          # tenant explicitly. Tenant.id matches AppConfiguration.id.
          scope = scope.where(id: tenant.id) if Apartment.excluded_models.include?(model.name)
          count = scope.count
          next if count.zero?

          puts "#{model.name}##{attr}: #{count} candidate record(s)"

          scope.find_each do |record|
            original = record[attr]
            next if original.nil?

            walker = ReplaceDeDeWithDeAtWalker.new
            after = original.deep_dup
            walker.process!(after)

            walker.skipped_paths.each do |p|
              puts "  SKIP: #{model.name} #{record.id} #{attr} at #{p} (de-AT already populated)"
            end
            total_skipped += walker.skipped

            next if walker.replaced.zero?

            walker.replaced_paths.each do |p|
              puts "  #{execute ? 'REPLACED' : 'WOULD REPLACE'} #{model.name} #{record.id} #{attr} at #{p}"
            end

            context = {
              tenant: host,
              model: model.name,
              record_id: record.id,
              attribute: attr,
              replaced: walker.replaced,
              skipped: walker.skipped,
              replaced_paths: walker.replaced_paths,
              skipped_paths: walker.skipped_paths
            }
            reporter.add_change(original, after, context: context)
            total_replaced += walker.replaced

            next unless execute

            begin
              record.update_columns(attr => after)
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
      puts "  Multiloc keys #{execute ? 'replaced' : 'to be replaced'}:               #{total_replaced}"
      puts "  Multiloc keys skipped (de-AT already populated):  #{total_skipped}"
      puts "  User.locale values #{execute ? 'replaced' : 'to be replaced'}:          #{total_users_updated}"
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

# Recursively walks a JSON structure and renames every `de-DE` hash key to
# `de-AT`, keeping a duplicate of the value. A multiloc that already has a
# populated (non-empty) `de-AT` value at the same path is left untouched.
# Renames hash keys only; string values are not touched.
class ReplaceDeDeWithDeAtWalker
  attr_reader :replaced, :skipped, :replaced_paths, :skipped_paths

  def initialize
    @replaced = 0
    @skipped = 0
    @replaced_paths = []
    @skipped_paths = []
  end

  # Mutates +node+ in place.
  def process!(node, path = '$')
    walk(node, path)
  end

  private

  def walk(node, path)
    case node
    when Hash
      # Recurse first, then mutate, to avoid modifying the hash while iterating.
      node.each { |key, value| walk(value, "#{path}.#{key}") }
      replace_de_de_key(node, path) if node.key?('de-DE')
    when Array
      node.each_with_index { |value, index| walk(value, "#{path}[#{index}]") }
    end
  end

  def replace_de_de_key(multiloc, path)
    de_at_value = multiloc['de-AT']
    # Replace if de-AT is absent (or JSON null) or an empty string; otherwise
    # leave de-DE alone.
    if de_at_value.nil? || de_at_value == ''
      multiloc['de-AT'] = multiloc.delete('de-DE')
      @replaced += 1
      @replaced_paths << path
    else
      @skipped += 1
      @skipped_paths << path
    end
  end
end
