require 'json'

namespace :single_use do
  desc 'Heal form fields ordering'
  task :heal_form_fields_ordering, [:hosts] => :environment do |_task, args|
    dry_run = ENV['DRY_RUN'].present?

    SemanticLogger.named_tagged(
      rake_task: 'single_use:heal_form_fields_ordering',
      run_id: SecureRandom.uuid
    ) do
      hosts = args[:hosts].to_s.split('+').map(&:strip).uniq
      scope = hosts.empty? ? nil : Tenant.where(host: hosts)

      Tenant.safe_switch_each(scope: scope) do |tenant|
        SemanticLogger.named_tagged(tenant_id: tenant.id) do
          if dry_run
            ActiveRecord::Base.transaction do
              CustomForm.find_each(&:heal_fields_ordering!)
              raise ActiveRecord::Rollback
            end
          else
            CustomForm.find_each(&:heal_fields_ordering!)
          end
        end
      end
    end
  end
end
