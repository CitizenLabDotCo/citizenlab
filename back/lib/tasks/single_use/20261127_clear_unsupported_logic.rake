# frozen_string_literal: true

# Clears the stored logic of every field whose input type does not support logic.
#
# Saving a field clears logic its type does not support, but logic stored before (ranking logic,
# rules written through the API or outside the app) stays until the form is saved again, and the
# survey results still apply it. Ranking logic even makes the results fail when a response ranks
# options with and without a rule.
#
# Whether a field supports logic is asked of the field itself, as on save: rating questions and
# multiselect questions created before multiselect logic was discontinued keep theirs. Run it
# right after the release that added rating logic and kept the legacy multiselect logic, not
# before, or it clears those too.
#
# `TenantScript` owns the dry run, the tenant loop and the report.
#
#     rake single_use:clear_unsupported_logic                     # dry run, all tenants
#     rake 'single_use:clear_unsupported_logic[execute]'          # clear, all tenants
#     rake 'single_use:clear_unsupported_logic[execute,foo.com]'  # clear, one tenant
namespace :single_use do
  desc "Clear the logic of fields whose input type does not support logic. Dry run unless passed 'execute'."
  task :clear_unsupported_logic, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run(
      'clear_unsupported_logic',
      args: args,
      description: 'clearing logic on input types that do not support it'
    ) do |tenant, script|
      CustomField.where.not(logic: {}).find_each do |field|
        next if field.supports_logic?

        script.reporter.add_change(
          field.logic, {},
          context: { tenant: tenant.host, custom_field_id: field.id, input_type: field.input_type, resource_id: field.resource_id }
        )
        field.update_column(:logic, {}) if script.execute?
      end
    end
  end
end
