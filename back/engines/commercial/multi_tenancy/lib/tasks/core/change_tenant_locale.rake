# frozen_string_literal: true

# This rake task changes a tenant's locale by renaming locale keys across all multiloc fields
# and craftjs_json content.
#
# Usage:
#   rake fix_existing_tenants:change_tenant_locale[hostname.com,en-GB,en]
#
# The task will:
#   1. Add the new locale to AppConfiguration settings (alongside the current locale)
#   2. Update User.locale for all users with the current locale
#   3. Find all models with multiloc columns (columns ending in '_multiloc')
#   4. Rename the locale key from current_locale to new_locale in each multiloc field
#   5. Rename locale keys in craftjs_json text nodes (ContentBuilder::Layout)
#   6. Remove the old locale from AppConfiguration settings
#   7. Display a summary of changes made
#
# Notes:
#   - This is a destructive operation
#   - The task will skip records where the current_locale key doesn't exist

namespace :fix_existing_tenants do
  desc 'Change tenant locale by renaming locale keys in settings, multilocs, and craftjs_json'
  task :change_tenant_locale, %i[host current_locale new_locale] => :environment do |_t, args|
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

      ChangeTenantLocale.run(current_locale, new_locale)
    end
  end
end

# rubocop:disable Metrics/ModuleLength
module ChangeTenantLocale
  class << self
    attr_accessor :current_locale, :new_locale, :records_updated, :fields_updated, :model_summary

    def run(current_locale, new_locale)
      @current_locale = current_locale
      @new_locale = new_locale
      @records_updated = 0
      @fields_updated = 0
      @model_summary = {}

      add_new_locale
      update_user_locales
      update_multilocs
      update_craftjs_layouts
      remove_old_locale
      print_summary
    end

    private

    def add_new_locale
      puts "\nAdding new locale to AppConfiguration settings..."
      app_config = AppConfiguration.instance
      current_locales = app_config.settings('core', 'locales') || []
      current_locale_index = current_locales.index(current_locale)

      locales_with_new = current_locales.dup
      locales_with_new.insert(current_locale_index, new_locale)

      app_config.settings['core']['locales'] = locales_with_new
      app_config.update_column(:settings, app_config.settings)
      puts "  Added #{new_locale}: #{locales_with_new.join(', ')}"
    end

    def update_user_locales
      puts "\nUpdating User locales..."
      users_updated = User.where(locale: current_locale).update_all(locale: new_locale)
      puts "  Updated #{users_updated} users from #{current_locale} to #{new_locale}"

      model_summary['User (locale)'] = users_updated if users_updated.positive?
      @records_updated += users_updated
    end

    def update_multilocs
      puts "\nUpdating multiloc fields..."
      data_listing_service = Cl2DataListingService.new

      data_listing_service.cl2_schema_models.each do |model|
        multiloc_columns = data_listing_service.multiloc_attributes(model)
        next if multiloc_columns.empty?

        model_updates = process_model_multilocs(model, multiloc_columns)
        model_summary[model.name] = model_updates if model_updates.positive?
      end
    end

    def process_model_multilocs(model, multiloc_columns)
      model_updates = 0

      model.find_each do |record|
        record_modified = false

        multiloc_columns.each do |column|
          value = record.read_attribute(column)
          next if value.blank?
          next unless rename_locale_key(value)

          record.update_column(column, value)
          record_modified = true
          @fields_updated += 1
        end

        if record_modified
          @records_updated += 1
          model_updates += 1
        end
      end

      model_updates
    end

    def update_craftjs_layouts
      return unless defined?(ContentBuilder::Layout)

      puts "\nUpdating ContentBuilder layouts..."
      craftjs_updates = 0

      ContentBuilder::Layout.find_each do |layout|
        craftjs_json = layout.craftjs_json
        next if craftjs_json.blank?

        layout_modified = process_craftjs_nodes(craftjs_json)

        if layout_modified
          layout.update_column(:craftjs_json, craftjs_json)
          @records_updated += 1
          craftjs_updates += 1
        end
      end

      model_summary['ContentBuilder::Layout (craftjs_json)'] = craftjs_updates if craftjs_updates.positive?
    end

    def process_craftjs_nodes(craftjs_json)
      layout_modified = false

      craftjs_json.each_value do |node_value|
        next unless node_value.is_a?(Hash)
        next unless node_value['type'].is_a?(Hash)

        resolved_name = node_value['type']['resolvedName']
        next unless ContentBuilder::Layout::TEXT_CRAFTJS_NODE_TYPES.include?(resolved_name)

        # Process 'text' prop (present in both TextMultiloc and AccordionMultiloc)
        text_multiloc = node_value.dig('props', 'text')
        if text_multiloc.is_a?(Hash) && rename_locale_key(text_multiloc)
          layout_modified = true
          @fields_updated += 1
        end

        # Process 'title' prop (only in AccordionMultiloc)
        next unless resolved_name == 'AccordionMultiloc'

        title_multiloc = node_value.dig('props', 'title')
        if title_multiloc.is_a?(Hash) && rename_locale_key(title_multiloc)
          layout_modified = true
          @fields_updated += 1
        end
      end

      layout_modified
    end

    def remove_old_locale
      puts "\nRemoving old locale from AppConfiguration settings..."
      app_config = AppConfiguration.instance
      final_locales = app_config.settings['core']['locales'].reject { |l| l == current_locale }

      app_config.settings['core']['locales'] = final_locales
      app_config.update_column(:settings, app_config.settings)
      puts "  Removed #{current_locale}: #{final_locales.join(', ')}"
    end

    def print_summary
      puts "\n#{'=' * 80}"
      puts 'SUMMARY'
      puts '=' * 80

      if model_summary.empty?
        puts 'No multiloc fields found with the current locale.'
      else
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

    def rename_locale_key(multiloc)
      return false unless multiloc.is_a?(Hash) && multiloc.key?(current_locale)
      return false if multiloc.key?(new_locale) # Don't overwrite existing target locale

      multiloc[new_locale] = multiloc.delete(current_locale)
      true
    end
  end
end
# rubocop:enable Metrics/ModuleLength
