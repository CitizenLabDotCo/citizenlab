# frozen_string_literal: true

# `single_use:set_default_character_limits_for_custom_fields` (2025-08-20, run on 2025-09-03)
# set `min_characters = 3` on every text custom field of every tenant, registration questions
# included. Registration questions are meant to accept any non-empty answer, and the registration
# question editor has no character limit setting, so admins could neither see nor lift that hidden
# limit: residents with a 1- or 2-character answer (a house number such as 6 or 25) could not
# finish signing up (TAN-8809, and TAN-7351 / TAN-7697 fixed by hand on single tenants).
#
# This lifts the backfilled minimum. Only the backfill's value (3) is reset: nothing in the UI can
# set a minimum on a registration question, so any other value was set on purpose — those are left
# alone, listed in the summary and written to a `_left_alone` JSON report for review.
#
# Tenant templates are exported from the template tenants, so they carried the minimum too, and so
# did platforms created from them. Run the task on every cluster, including the one hosting the
# template tenants: the next template release is then clean.
#
# `TenantScript` owns the dry run, the tenant loop and the report.
#
#     rake single_use:reset_backfilled_min_characters_on_registration_fields                     # dry run, all tenants
#     rake 'single_use:reset_backfilled_min_characters_on_registration_fields[execute]'          # write, all tenants
#     rake 'single_use:reset_backfilled_min_characters_on_registration_fields[execute,foo.com]'  # write, one tenant
namespace :single_use do
  desc "Lift the 3-character minimum the 2025 backfill put on registration text questions. Dry run unless passed 'execute'."
  task :reset_backfilled_min_characters_on_registration_fields, %i[execute host] => [:environment] do |_t, args|
    backfilled_min_characters = 3
    left_alone = []

    TenantScript.run(
      'reset_backfilled_min_characters_on_registration_fields',
      args: args,
      description: "lifting the backfilled #{backfilled_min_characters}-character minimum on registration text questions",
      summary: lambda { |script|
        left_alone_file = script.report_file.sub(/\.json\z/, '_left_alone.json')
        File.write(left_alone_file, JSON.pretty_generate(left_alone))
        next if left_alone.empty?

        puts "\n   Registration questions with another minimum, left alone (#{left_alone.size}):"
        left_alone.each do |field|
          puts "     #{field[:tenant]}: #{field[:field_key]} (#{field[:field_id]}) min_characters=#{field[:min_characters]}"
        end
        puts "   📝 Left alone: #{left_alone_file}"
      }
    ) do |tenant, script|
      fields = CustomField.registration
        .where(input_type: %w[text multiline_text])
        .where.not(min_characters: nil)

      fields.find_each do |field|
        context = { tenant: tenant.host, field_id: field.id, field_key: field.key }

        if field.min_characters != backfilled_min_characters
          left_alone << context.merge(min_characters: field.min_characters)
          next
        end

        script.reporter.add_change(field.min_characters, nil, context: context)
        # `update_column` leaves `updated_at` alone, so it still shows when the minimum was set:
        # the backfill run, or the platform's creation from a template.
        field.update_column(:min_characters, nil) if script.execute?
      end
    end
  end
end
