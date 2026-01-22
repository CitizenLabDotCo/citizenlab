# frozen_string_literal: true

# This rake task audits all multiloc fields across all models for a given demo tenant,
# identifying records where translations are missing or empty for configured locales.
#
# Usage:
#   rake 'demos:translate_missing_locales[hostname.com]'         - Audit only, report issues
#   rake 'demos:translate_missing_locales[hostname.com,true]'   - Audit and translate missing locales
#
# The task will:
#   1. Find all models with multiloc columns (columns ending in '_multiloc')
#   2. Check each record's multiloc fields against the tenant's configured locales
#   3. Report any locales that are missing or have empty values
#   4. Optionally translate missing content using Google Translate (or copy in dev mode)
#   5. Display a summary with issue counts per model and total characters to translate
#
# Notes:
#   - Translations can only be run on demo platforms (lifecycle_stage = 'demo') or local development
#   - Readonly records (e.g., database views) are skipped
#   - Records where all locale values are empty are skipped
#   - In development mode, translation just copies the source text (no API calls)
#   - Translation prefers the main locale as source, falls back to any available locale
#   - Also processes text values in craftjs_json field of content_builder_layouts

namespace :demos do
  desc 'Audit and optionally translate missing multiloc fields for a demo tenant'
  task :translate_missing_locales, %i[host translate] => :environment do |_t, args|
    if args[:host].blank?
      puts 'Host parameter is required. Usage: rake demos:translate_missing_locales[host,translate]'
      next
    end

    tenant = Tenant.find_by(host: args[:host])

    if tenant.nil?
      puts "Tenant not found: #{args[:host]}"
      next
    end

    tenant.switch do
      translate_missing = args[:translate].to_s.downcase == 'true'
      TranslateMissingLocales.run(tenant, translate_missing)
    end
  end
end

# rubocop:disable Metrics/ModuleLength
module TranslateMissingLocales
  class << self
    attr_accessor :tenant, :translate_missing, :locales, :main_locale, :translation_service,
      :issues_found, :translations_made, :total_characters, :model_summary

    def run(tenant, translate_missing)
      @tenant = tenant
      @translate_missing = translate_missing
      @issues_found = 0
      @translations_made = 0
      @total_characters = 0
      @model_summary = {}

      return unless validate_configuration

      print_header
      process_all_models
      process_craftjs_layouts
      print_summary
    end

    private

    def validate_configuration
      @locales = AppConfiguration.instance.settings('core', 'locales')

      if locales.blank?
        puts 'No locales configured in settings. Skipping.'
        return false
      end

      @main_locale = locales.first
      lifecycle_stage = AppConfiguration.instance.settings('core', 'lifecycle_stage')
      is_demo = lifecycle_stage == 'demo'

      if translate_missing && !is_demo && !Rails.env.development?
        puts "ERROR: Translations can only be run on demo platforms (current: #{lifecycle_stage})"
        puts 'Run without the translate flag to audit only.'
        return false
      end

      @translation_service = MachineTranslations::MachineTranslationService.new if translate_missing

      true
    end

    def print_header
      puts "\n#{'=' * 80}"
      puts "Tenant: #{tenant.host}"
      puts '=' * 80
      puts "Configured locales: #{locales.join(', ')} (main: #{main_locale})"
      puts "Lifecycle stage: #{AppConfiguration.instance.settings('core', 'lifecycle_stage')}"
      puts "Translate missing: #{translate_missing}"
      puts '-' * 80
    end

    def process_all_models
      data_listing_service = Cl2DataListingService.new

      data_listing_service.cl2_schema_models.each do |model|
        multiloc_columns = data_listing_service.multiloc_attributes(model)
        next if multiloc_columns.empty?

        model_issues = process_model(model, multiloc_columns)
        report_model_issues(model, model_issues) if model_issues.any?
      end
    end

    def process_model(model, multiloc_columns)
      model_issues = []

      model.find_each do |record|
        next if record.readonly?

        multiloc_columns.each do |column|
          issue = process_multiloc_field(model, record, column)
          model_issues << issue if issue
        end
      end

      model_issues
    end

    def process_multiloc_field(model, record, column)
      value = record.send(column)
      return nil if value.blank? || value.values.all?(&:blank?)

      missing_locales, empty_locales = find_missing_locales(value)
      return nil if missing_locales.empty? && empty_locales.empty?

      @issues_found += 1

      issue = {
        id: record.id,
        column: column,
        missing_locales: missing_locales,
        empty_locales: empty_locales
      }

      translate_multiloc_field(model, record, column, value, missing_locales + empty_locales)

      issue
    end

    def find_missing_locales(value)
      missing_locales = []
      empty_locales = []

      locales.each do |locale|
        if !value.key?(locale)
          missing_locales << locale
        elsif value[locale].blank?
          empty_locales << locale
        end
      end

      [missing_locales, empty_locales]
    end

    def translate_multiloc_field(model, record, column, value, locales_to_translate)
      source_locale = find_source_locale(value)
      return unless source_locale

      source_text = value[source_locale]
      @total_characters += source_text.to_s.length * locales_to_translate.size

      return unless translate_missing

      locales_to_translate.each do |target_locale|
        translate_to_locale(model, record, column, value, source_locale, target_locale, source_text)
      end

      record.update_column(column, value)
    end

    def find_source_locale(value)
      return main_locale if value[main_locale].present?

      value.find { |_, v| v.present? }&.first
    end

    def translate_to_locale(model, record, column, value, source_locale, target_locale, source_text)
      if Rails.env.development?
        value[target_locale] = source_text
        @translations_made += 1
        puts "  Copied #{model.name}##{record.id}.#{column} from #{source_locale} to #{target_locale} (dev mode)"
      else
        translated_text = translation_service.translate(source_text, source_locale, target_locale)
        value[target_locale] = translated_text
        @translations_made += 1
        puts "  Translated #{model.name}##{record.id}.#{column} from #{source_locale} to #{target_locale}"
      end
    rescue StandardError => e
      puts "  ERROR translating #{model.name}##{record.id}.#{column} to #{target_locale}: #{e.message}"
    end

    def report_model_issues(model, model_issues)
      model_summary[model.name] = model_issues.size

      puts "\n#{model.name} (#{model_issues.size} issues)"
      puts '-' * 40

      model_issues.each do |issue|
        messages = []
        messages << "missing: #{issue[:missing_locales].join(', ')}" if issue[:missing_locales].any?
        messages << "empty: #{issue[:empty_locales].join(', ')}" if issue[:empty_locales].any?

        puts "  ID: #{issue[:id]} | #{issue[:column]} | #{messages.join(' | ')}"
      end
    end

    def process_craftjs_layouts
      return unless defined?(ContentBuilder::Layout)

      craftjs_issues = []

      ContentBuilder::Layout.find_each do |layout|
        layout_issues, layout_modified = process_craftjs_layout(layout)
        craftjs_issues.concat(layout_issues)
        layout.update_column(:craftjs_json, layout.craftjs_json) if layout_modified
      end

      report_craftjs_issues(craftjs_issues) if craftjs_issues.any?
    end

    def process_craftjs_layout(layout)
      craftjs_json = layout.craftjs_json
      return [[], false] if craftjs_json.blank?

      issues = []
      layout_modified = false

      craftjs_json.each do |node_key, node_value|
        node_issues, node_modified = process_craftjs_node(layout, node_key, node_value)
        issues.concat(node_issues)
        layout_modified ||= node_modified
      end

      [issues, layout_modified]
    end

    def process_craftjs_node(layout, node_key, node_value)
      return [[], false] unless node_value.is_a?(Hash)
      return [[], false] unless node_value['type'].is_a?(Hash)

      resolved_name = node_value['type']['resolvedName']
      return [[], false] unless ContentBuilder::Layout::TEXT_CRAFTJS_NODE_TYPES.include?(resolved_name)

      issues = []
      node_modified = false

      # Process 'text' prop
      text_result = process_craftjs_multiloc(layout, node_key, 'text', node_value.dig('props', 'text'))
      if text_result
        issues << text_result[:issue]
        node_modified ||= text_result[:modified]
      end

      # Process 'title' prop (only in AccordionMultiloc)
      if resolved_name == 'AccordionMultiloc'
        title_result = process_craftjs_multiloc(layout, node_key, 'title', node_value.dig('props', 'title'))
        if title_result
          issues << title_result[:issue]
          node_modified ||= title_result[:modified]
        end
      end

      [issues, node_modified]
    end

    def process_craftjs_multiloc(layout, node_key, prop, multiloc)
      return nil unless multiloc.is_a?(Hash) && multiloc.values.any?(&:present?)

      missing_locales, empty_locales = find_missing_locales(multiloc)
      return nil if missing_locales.empty? && empty_locales.empty?

      @issues_found += 1

      issue = {
        id: layout.id,
        node_key: node_key,
        prop: prop,
        missing_locales: missing_locales,
        empty_locales: empty_locales
      }

      modified = translate_craftjs_multiloc(multiloc, missing_locales + empty_locales)

      { issue: issue, modified: modified }
    end

    def translate_craftjs_multiloc(multiloc, locales_to_translate)
      source_locale = find_source_locale(multiloc)
      return false unless source_locale

      source_text = multiloc[source_locale]
      @total_characters += source_text.to_s.length * locales_to_translate.size

      return false unless translate_missing

      modified = false

      locales_to_translate.each do |target_locale|
        if Rails.env.development?
          multiloc[target_locale] = source_text
          @translations_made += 1
          modified = true
          puts "  Copied craftjs_json text from #{source_locale} to #{target_locale} (dev mode)"
        else
          translated_text = translation_service.translate(source_text, source_locale, target_locale)
          multiloc[target_locale] = translated_text
          @translations_made += 1
          modified = true
          puts "  Translated craftjs_json text from #{source_locale} to #{target_locale}"
        end
      rescue StandardError => e
        puts "  ERROR translating craftjs_json text to #{target_locale}: #{e.message}"
      end

      modified
    end

    def report_craftjs_issues(craftjs_issues)
      model_summary['ContentBuilder::Layout (craftjs_json)'] = craftjs_issues.size

      puts "\nContentBuilder::Layout craftjs_json (#{craftjs_issues.size} issues)"
      puts '-' * 40

      craftjs_issues.each do |issue|
        messages = []
        messages << "missing: #{issue[:missing_locales].join(', ')}" if issue[:missing_locales].any?
        messages << "empty: #{issue[:empty_locales].join(', ')}" if issue[:empty_locales].any?

        puts "  ID: #{issue[:id]} | node: #{issue[:node_key]} | #{issue[:prop]} | #{messages.join(' | ')}"
      end
    end

    def print_summary
      puts "\n#{'=' * 80}"
      puts "SUMMARY FOR #{tenant.host}"
      puts '=' * 80

      if model_summary.empty?
        puts 'No issues found.'
        return
      end

      puts "\n#{'Model'.ljust(40)} | Count"
      puts '-' * 50

      model_summary.sort_by { |_, count| -count }.each do |model_name, count|
        puts "#{model_name.ljust(40)} | #{count}"
      end

      puts '-' * 50
      puts "#{'Total'.ljust(40)} | #{issues_found}"

      formatted_chars = total_characters.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
      puts "\nCharacters #{translate_missing ? 'translated' : 'to translate'}: #{formatted_chars}"
      puts "Translations made: #{translations_made}" if translate_missing
    end
  end
end
# rubocop:enable Metrics/ModuleLength
