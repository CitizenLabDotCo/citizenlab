# frozen_string_literal: true

namespace :single_use do
  desc 'Sets default character limits for existing custom fields'
  task set_default_character_limits_for_custom_fields: :environment do
    reporter = ScriptReporter.new

    Rails.logger.info 'single_use:set_default_character_limits_for_custom_fields started\n\n'

    Tenant.safe_switch_each do |tenant|
      Rails.logger.info "Setting default character limits for tenant #{tenant.name}\n\n"

      # Get all text-supporting custom fields (excluding html_multiloc)
      text_fields = CustomField.where(input_type: %w[text multiline_text text_multiloc])

      text_fields.each do |field|
        original_field = field.deep_dup
        updated = false

        # Set min_characters = 3 for all text fields if not already set
        if field.min_characters.nil?
          field.min_characters = 3
          updated = true
        end

        # Set max_characters = 120 for built-in title_multiloc fields if not already set
        if field.code == 'title_multiloc' && field.max_characters.nil?
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

  desc 'DRY RUN: Shows what would be changed for custom field character limits without making changes'
  task dry_run_set_default_character_limits_for_custom_fields: :environment do
    puts '=== DRY RUN: Custom Field Character Limits Migration ===\n\n'
    puts 'This task will show what changes would be made without actually applying them.\n\n'

    total_changes = 0
    total_fields_processed = 0

    Tenant.safe_switch_each do |tenant|
      puts "=== Processing Tenant: #{tenant.name} (#{tenant.host}) ===\n"

      # Get all text-supporting custom fields (excluding html_multiloc)
      text_fields = CustomField.where(input_type: %w[text multiline_text text_multiloc])
      tenant_changes = 0

      puts "Found #{text_fields.count} text fields to process\n\n"

      text_fields.each do |field|
        total_fields_processed += 1
        changes = []

        # Check if min_characters needs to be set
        if field.min_characters.nil?
          changes << 'min_characters: nil → 3'
        end

        # Check if max_characters needs to be set for title_multiloc
        if field.code == 'title_multiloc' && field.max_characters.nil?
          changes << 'max_characters: nil → 120'
        end

        if changes.any?
          tenant_changes += 1
          total_changes += 1
          puts "  [CHANGE] Field: #{field.key} (ID: #{field.id})"
          puts "    Type: #{field.input_type}"
          puts "    Code: #{field.code || 'N/A'}"
          puts "    Changes: #{changes.join(', ')}"
        else
          puts "  [NO CHANGE] Field: #{field.key} (ID: #{field.id}) - Already has appropriate limits"
        end
        puts "    Current: min_characters=#{field.min_characters.inspect}, max_characters=#{field.max_characters.inspect}"
        puts ''
      end

      puts "Tenant #{tenant.name}: #{tenant_changes} fields would be updated out of #{text_fields.count} total fields\n"
      puts "---\n\n"
    end

    puts '=== SUMMARY ==='
    puts "Total fields processed: #{total_fields_processed}"
    puts "Total fields that would be changed: #{total_changes}"
    puts "\nTo apply these changes, run: rake single_use:set_default_character_limits_for_custom_fields"
    puts '=== DRY RUN COMPLETED ===\n'
  end
end
