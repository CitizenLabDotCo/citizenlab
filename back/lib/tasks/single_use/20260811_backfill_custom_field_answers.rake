# Backfills custom_field_answers from the custom_field_values hashes of ideas
# and users, through the same sync! reconciliation the callbacks use.
# Idempotent; records that error are logged and skipped.
#
# Usage: rake single_use:backfill_custom_field_answers
#        rake single_use:backfill_custom_field_answers[my-tenant.govocal.com]

namespace :single_use do
  desc 'Backfill custom_field_answers from custom_field_values hashes'
  task :backfill_custom_field_answers, %i[tenant_host] => [:environment] do |_t, args|
    tenant_host_filter = args[:tenant_host].presence

    reporter = ScriptReporter.new
    service = CustomFieldAnswerService.new

    Tenant.safe_switch_each do |tenant|
      next if tenant_host_filter && tenant.host != tenant_host_filter

      reporter.add_processed_tenant(tenant)
      errors = 0
      scopes = [
        Idea.where.not(custom_field_values: {}),
        User.where.not(custom_field_values: nil).where.not(custom_field_values: {})
      ]
      scopes.each do |scope|
        scope.find_each do |record|
          record.with_lock { service.sync!(record) }
        rescue StandardError => e
          errors += 1
          reporter.add_error(
            "#{e.class}: #{e.message}",
            context: { tenant: tenant.host, record: "#{record.class.name}/#{record.id}" }
          )
        end
      end

      answers = CustomFieldAnswer.count
      orphans = CustomFieldAnswer.where(custom_field_id: nil).count
      puts "#{tenant.host}: #{answers} answers (#{orphans} orphans), #{errors} errors"
    end

    reporter.report!('backfill_custom_field_answers.json', verbose: true)
  end
end
