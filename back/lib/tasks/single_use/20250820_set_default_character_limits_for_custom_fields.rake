# frozen_string_literal: true

namespace :single_use do
  desc 'Sets default character limits for existing custom fields'
  task set_default_character_limits_for_custom_fields: :environment do
    reporter = ScriptReporter.new

    Rails.logger.info 'single_use:set_default_character_limits_for_custom_fields started\n\n'

    Tenant.safe_switch_each do |tenant|
      Rails.logger.info "Setting default character limits for tenant #{tenant.name}\n\n"

      # Get all text-supporting custom fields
      text_fields = CustomField.where(input_type: %w[text multiline_text text_multiloc html_multiloc])

      text_fields.each do |field|
        original_field = field.deep_dup
        updated = false

        # Set min_characters = 3 for all text fields if not already set
        if field.min_characters.nil?
          field.min_characters = 3
          updated = true
        end

        # Set max_characters = 120 for title_multiloc fields if not already set
        if field.input_type == 'text_multiloc' && field.key == 'title_multiloc' && field.max_characters.nil?
          field.max_characters = 120
          updated = true
        end

        # Also ensure title_multiloc fields have the correct limits even if they have other values
        if field.input_type == 'text_multiloc' &&
           field.key == 'title_multiloc' &&
           (field.min_characters != 3 || field.max_characters != 120)
          field.min_characters = 3
          field.max_characters = 120
          updated = true
        end

        # Save and report if any changes were made
        if updated
          if field.save
            reporter.add_change(
              original_field.attributes,
              field.attributes,
              context: { tenant: tenant.host, field_id: field.id, field_key: field.key }
            )
            puts "Updated field #{field.key} (ID: #{field.id}) - min_characters: #{field.min_characters}, max_characters: #{field.max_characters}"
          else
            reporter.add_error(
              field.errors.details,
              context: { tenant: tenant.host, field_id: field.id, field_key: field.key }
            )
            puts "Error updating field #{field.key} (ID: #{field.id}): #{field.errors.full_messages.join(', ')}"
          end
        else
          puts "Field #{field.key} (ID: #{field.id}) already has appropriate character limits - min_characters: #{field.min_characters}, max_characters: #{field.max_characters}"
        end
      end

      puts "\nCompleted processing tenant #{tenant.name}\n"
    end

    reporter.report!('set_default_character_limits_for_custom_fields.json', verbose: true)
    Rails.logger.info 'single_use:set_default_character_limits_for_custom_fields completed\n\n'
  end
end
