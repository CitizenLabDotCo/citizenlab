# frozen_string_literal: true

# Deleting an area used to leave behind the domicile answers a survey form had stored on
# its inputs (only the answers stored on users were cleaned up), so those inputs keep
# referencing an area that no longer exists. This task removes the leftovers on tenants
# that were affected before the cleanup was extended to inputs.
namespace :single_use do
  desc 'Remove domicile answers on inputs that reference an area that no longer exists'
  task :scrub_stale_domicile_values, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'
    puts "---------- STARTING TASK: Scrub stale domicile values ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

    Tenant.all.find_each do |tenant|
      next unless Apartment.connection.schema_exists?(tenant.schema_name)

      begin
        tenant.switch do
          reporter.add_processed_tenant(tenant)

          domicile_field = CustomField.find_by(key: 'domicile', resource_type: 'User')
          next if domicile_field.nil?

          key = UserFieldsInFormService.prefix_key(domicile_field.key)
          known_values = Area.ids << 'outside'

          # Two separate condition strings on purpose: the jsonb `?` operator cannot share
          # a string with bind parameters.
          stale_inputs = Idea
            .where("custom_field_values ? '#{key}'")
            .where.not("custom_field_values->>'#{key}' IN (?)", known_values)

          stale_by_area_id = stale_inputs.pluck(Arel.sql("custom_field_values->>'#{key}'")).tally
          next if stale_by_area_id.empty?

          total = stale_by_area_id.values.sum
          puts "Tenant: #{tenant.host} - #{total} input(s) referencing #{stale_by_area_id.size} deleted area(s)"
          stale_by_area_id.each { |area_id, count| puts "  #{area_id}: #{count} input(s)" }

          stale_inputs.update_all("custom_field_values = custom_field_values - '#{key}'") if execute

          reporter.add_change(
            stale_by_area_id,
            {},
            context: { tenant: tenant.host, custom_field_key: key, inputs_affected: total }
          )
        end
      rescue Apartment::TenantNotFound, StandardError => e
        reporter.add_error(e.message, context: { tenant: tenant.host })
        puts "ERROR! Failed to process tenant #{tenant.host}: #{e.message}"
      end
    end

    reporter.report!('scrub_stale_domicile_values.json', verbose: false)

    puts "\n---------- FINISHED TASK: Scrub stale domicile values ----------\n\n"
  end
end
