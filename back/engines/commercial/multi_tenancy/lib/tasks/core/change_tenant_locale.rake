# frozen_string_literal: true

# This rake task changes a tenant's locale by renaming locale keys across all multiloc fields
# and craftjs_json content.
#
# Usage:
#   rake 'core:change_tenant_locale[hostname.com,en-GB,en]'
#
# The task will:
#   1. Update User.locale for all users with the current locale
#   2. Update the locale in AppConfiguration settings
#   3. Find all models with multiloc columns (columns ending in '_multiloc')
#   4. Rename the locale key from current_locale to new_locale in each multiloc field
#   5. Rename locale keys in craftjs_json text nodes (ContentBuilder::Layout)
#   6. Display a summary of changes made
#
# Notes:
#   - This is a destructive operation
#   - The task will skip records where the current_locale key doesn't exist

namespace :core do
  desc 'Change tenant locale by renaming locale keys in settings, multilocs, and craftjs_json'
  task :change_tenant_locale, %i[host current_locale new_locale] => :environment do |_t, args|
    # Validate parameters
    if args[:host].blank?
      puts 'Host parameter is required. Usage: rake core:change_tenant_locale[host,current_locale,new_locale]'
      next
    end

    if args[:current_locale].blank? || args[:new_locale].blank?
      puts 'Both current_locale and new_locale are required.'
      next
    end

    current_locale = args[:current_locale]
    new_locale = args[:new_locale]

    if current_locale == new_locale
      puts 'current_locale and new_locale cannot be the same.'
      next
    end

    tenant = Tenant.find_by(host: args[:host])

    if tenant.nil?
      puts "Tenant not found: #{args[:host]}"
      next
    end

    tenant.switch do
      puts "\n#{'=' * 80}"
      puts "Tenant: #{tenant.host}"
      puts "Changing locale: #{current_locale} -> #{new_locale}"
      puts '=' * 80

      # Get current configured locales
      app_config = AppConfiguration.instance
      current_locales = app_config.settings('core', 'locales') || []

      unless current_locales.include?(current_locale)
        puts "ERROR: current_locale '#{current_locale}' is not in configured locales: #{current_locales.join(', ')}"
        next
      end

      if current_locales.include?(new_locale)
        puts "ERROR: new_locale '#{new_locale}' already exists in configured locales: #{current_locales.join(', ')}"
        next
      end

      # Initialize counters
      records_updated = 0
      fields_updated = 0
      model_summary = {}

      # Update user locales first (before changing settings to avoid validation errors)
      puts "\nUpdating User locales..."
      users_updated = User.where(locale: current_locale).update_all(locale: new_locale)
      puts "  Updated #{users_updated} users from #{current_locale} to #{new_locale}"
      model_summary['User (locale)'] = users_updated if users_updated > 0
      records_updated += users_updated

      # Update settings (use update_column to bypass schema validations for legacy properties)
      puts "\nUpdating AppConfiguration settings..."
      new_locales = current_locales.map { |l| l == current_locale ? new_locale : l }
      app_config.settings['core']['locales'] = new_locales
      app_config.update_column(:settings, app_config.settings)
      puts "  Updated locales: #{current_locales.join(', ')} -> #{new_locales.join(', ')}"

      # Helper lambda to rename locale key in a multiloc hash
      # Returns false if no change needed, true if key was renamed
      rename_locale_key = lambda do |multiloc|
        return false unless multiloc.is_a?(Hash) && multiloc.key?(current_locale)
        return false if multiloc.key?(new_locale) # Don't overwrite existing target locale

        multiloc[new_locale] = multiloc.delete(current_locale)
        true
      end

      # Iterate through all models
      data_listing_service = Cl2DataListingService.new
      data_listing_service.cl2_schema_models.each do |model|
        # Find columns that store multiloc data (JSON with locale keys)
        multiloc_columns = data_listing_service.multiloc_attributes(model)
        next if multiloc_columns.empty?

        # Process each record in batches
        model_updates = 0
        model.find_each do |record|
          record_modified = false

          multiloc_columns.each do |column|
            # Use read_attribute to get raw value without triggering custom methods
            value = record.read_attribute(column)

            # Skip nil or empty multilocs
            next if value.blank?

            # Rename the locale key if it exists
            next unless rename_locale_key.call(value)

            # Save the updated multiloc (bypasses validations/callbacks)
            record.update_column(column, value)
            record_modified = true
            fields_updated += 1
          end

          if record_modified
            records_updated += 1
            model_updates += 1
          end
        end

        # Track updates per model for summary
        model_summary[model.name] = model_updates if model_updates > 0
      end

      # Process craftjs_json text values in ContentBuilder::Layout records
      if defined?(ContentBuilder::Layout)
        craftjs_updates = 0

        ContentBuilder::Layout.find_each do |layout|
          craftjs_json = layout.craftjs_json
          next if craftjs_json.blank?

          layout_modified = false

          craftjs_json.each_value do |node_value|
            next unless node_value.is_a?(Hash)
            next unless node_value['type'].is_a?(Hash)

            resolved_name = node_value['type']['resolvedName']
            next unless ContentBuilder::Layout::TEXT_CRAFTJS_NODE_TYPES.include?(resolved_name)

            # Process 'text' prop (present in both TextMultiloc and AccordionMultiloc)
            text_multiloc = node_value.dig('props', 'text')
            if text_multiloc.is_a?(Hash) && rename_locale_key.call(text_multiloc)
              layout_modified = true
              fields_updated += 1
            end

            # Process 'title' prop (only in AccordionMultiloc)
            next unless resolved_name == 'AccordionMultiloc'

            title_multiloc = node_value.dig('props', 'title')
            next unless title_multiloc.is_a?(Hash) && rename_locale_key.call(title_multiloc)

            layout_modified = true
            fields_updated += 1
          end

          if layout_modified
            layout.update_column(:craftjs_json, craftjs_json)
            records_updated += 1
            craftjs_updates += 1
          end
        end

        model_summary['ContentBuilder::Layout (craftjs_json)'] = craftjs_updates if craftjs_updates > 0
      end

      # Print summary
      puts "SUMMARY FOR #{tenant.host}"
      puts '=' * 80

      if model_summary.empty?
        puts 'No multiloc fields found with the current locale.'
      else
        # Print update counts per model, sorted by count descending
        puts "\n#{'Model'.ljust(50)} | Records Updated"
        puts '-' * 70

        model_summary.sort_by { |_, count| -count }.each do |model_name, count|
          puts "#{model_name.ljust(50)} | #{count}"
        end

        puts '-' * 70
        puts "#{'Total records updated'.ljust(50)} | #{records_updated}"
        puts "#{'Total fields updated'.ljust(50)} | #{fields_updated}"
      end

      puts "\nLocale change complete: #{current_locale} -> #{new_locale}"
    end
  end
end
