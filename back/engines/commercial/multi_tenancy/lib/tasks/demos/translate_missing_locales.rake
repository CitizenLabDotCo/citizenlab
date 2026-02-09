# frozen_string_literal: true

# This rake task audits all multiloc fields across all models for a given demo tenant,
# identifying records where translations are missing or empty for configured locales.
#
# Usage:
#   rails 'demos:translate_missing_locales[hostname.com,en]'                      - Audit only
#   rails 'demos:translate_missing_locales[hostname.com,en,true]'                 - Audit and translate
#   rails 'demos:translate_missing_locales[hostname.com,en,true,nl-NL:fr-BE]'     - With extra locales
#
# Parameters:
#   - host: The tenant hostname
#   - source_locale: The locale to translate from (must exist in tenant's configured locales)
#   - translate: Set to 'true' to perform translations, otherwise audit only - to count characters needing translation
#   - extra_locales: Optional colon-separated list of additional locales (not in app config) to translate to
#
# The task will:
#   1. Find all models with multiloc columns (columns ending in '_multiloc')
#   2. Check each record's multiloc fields against the tenant's configured locales (plus any extra)
#   3. Report any locales that are missing or have empty values
#   4. Optionally translate missing content using Google Translate (or copy in dev mode)
#   5. Display a summary with issue counts per model and total characters to translate
#
# Notes:
#   - Translations can only be run on demo platforms (lifecycle_stage = 'demo') or local development
#   - Records where all locale values are empty are skipped
#   - Records where the source locale value is missing are skipped (source locale is required)
#   - If a translation exists for the same language but different locale (e.g., fr-FR exists but fr-BE
#     is missing), the existing translation is copied instead of calling the translation API
#   - In development mode, translation just copies the source text (no API calls)
#   - Also processes text values in craftjs_json field of content_builder_layouts

namespace :demos do
  desc 'Audit and optionally translate missing multiloc fields for a demo tenant'
  task :translate_missing_locales, %i[host source_locale translate extra_locales] => :environment do |_t, args|
    if args[:host].blank? || args[:source_locale].blank?
      puts 'Host and source_locale parameters are required.'
      puts 'Usage: rake demos:translate_missing_locales[host,source_locale,translate,extra_locales]'
      puts 'Example: rake demos:translate_missing_locales[demo.example.com,en,true,nl-NL:fr-BE]'
      next
    end

    tenant = Tenant.find_by(host: args[:host])

    if tenant.nil?
      puts "Tenant not found: #{args[:host]}"
      next
    end

    tenant.switch do
      translate_missing = args[:translate].to_s.downcase == 'true'
      extra_locales = args[:extra_locales].to_s.split(':').compact_blank
      TranslateMissingLocales.run(tenant, args[:source_locale], translate_missing, extra_locales)
    end
  end
end

# rubocop:disable Metrics/ModuleLength
module TranslateMissingLocales
  class << self
    attr_accessor :tenant, :translate_missing, :locales, :source_locale, :extra_locales, :translation_service,
      :issues_found, :translations_made, :total_characters, :model_summary

    def run(tenant, source_locale, translate_missing, extra_locales = [])
      @tenant = tenant
      @source_locale = source_locale
      @translate_missing = translate_missing
      @extra_locales = extra_locales
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
      @locales = (@locales + extra_locales).uniq

      unless locales.include?(source_locale)
        puts "ERROR: Source locale '#{source_locale}' is not in configured locales: #{locales.join(', ')}"
        return false
      end

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
      puts "Configured locales: #{locales.join(', ')} (source: #{source_locale})"
      puts "Extra locales: #{extra_locales.join(', ')}" if extra_locales.any?
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
      # Use record[column] to get raw attribute value, bypassing any model-level locale filtering
      value = record[column]
      return nil if value.blank? || value.values.all?(&:blank?)

      missing_locales, empty_locales = find_missing_locales(value)
      return nil if missing_locales.empty? && empty_locales.empty?

      # Skip records where source locale is missing - don't count in issues
      source_text = value[source_locale.to_s]
      if source_text.blank?
        puts "  Skipped #{model.name}##{record.id}.#{column}: source locale '#{source_locale}' not present"
        return nil
      end

      @issues_found += 1

      issue = {
        id: record.id,
        column: column,
        missing_locales: missing_locales,
        empty_locales: empty_locales
      }

      translate_multiloc_field(model, record, column, value, missing_locales + empty_locales, source_text)

      issue
    end

    def find_missing_locales(value)
      missing_locales = []
      empty_locales = []

      locales.each do |locale|
        locale_str = locale.to_s
        if !value.key?(locale_str)
          missing_locales << locale_str
        elsif value[locale_str].blank?
          empty_locales << locale_str
        end
      end

      [missing_locales, empty_locales]
    end

    def translate_multiloc_field(model, record, column, value, locales_to_translate, source_text)
      # Count characters for locales that will actually need machine translation
      # Simulate the translation order to account for same-language copies from earlier translations
      @total_characters += count_characters_needing_translation(value, locales_to_translate, source_text)

      return unless translate_missing

      locales_to_translate.each do |target_locale|
        translate_to_locale(model, record, column, value, source_locale, target_locale, source_text)
      end

      record.update!(column => value, updated_at: record.updated_at)
    end

    def count_characters_needing_translation(value, locales_to_translate, source_text)
      # Simulate the translation process to accurately count characters
      # As we "translate" each locale, it becomes available for same-language copies
      simulated_value = value.dup
      chars_needed = 0

      locales_to_translate.each do |locale|
        locale_str = locale.to_s
        if find_same_language_translation(simulated_value, locale_str)
          # This locale can be copied from an existing same-language translation
          simulated_value[locale_str] = 'copied'
        else
          # This locale needs actual translation
          chars_needed += source_text.to_s.length
          simulated_value[locale_str] = 'translated'
        end
      end

      chars_needed
    end

    def language_code(locale)
      locale.to_s.split('-').first.downcase
    end

    def find_same_language_translation(value, target_locale)
      target_locale_str = target_locale.to_s
      target_language = language_code(target_locale_str)

      value.find do |locale, text|
        text.present? && locale.to_s != target_locale_str && language_code(locale) == target_language
      end
    end

    def translate_to_locale(model, record, column, value, source_locale, target_locale, source_text)
      target_locale_str = target_locale.to_s
      # Check if there's a same-language translation we can copy instead of translating
      same_language = find_same_language_translation(value, target_locale_str)
      if same_language
        same_lang_locale, same_lang_text = same_language
        value[target_locale_str] = same_lang_text
        @translations_made += 1
        puts "  Copied #{model.name}##{record.id}.#{column} from #{same_lang_locale} to #{target_locale_str} (same language)"
      elsif Rails.env.development?
        value[target_locale_str] = source_text
        @translations_made += 1
        puts "  Copied #{model.name}##{record.id}.#{column} from #{source_locale} to #{target_locale_str} (dev mode)"
      else
        translated_text = translation_service.translate(source_text, source_locale.to_s, target_locale_str)
        value[target_locale_str] = translated_text
        @translations_made += 1
        puts "  Translated #{model.name}##{record.id}.#{column} from #{source_locale} to #{target_locale_str}"
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
        layout.update!(craftjs_json: layout.craftjs_json, updated_at: layout.updated_at) if layout_modified
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

      # Skip when source locale is missing - don't count in issues
      source_text = multiloc[source_locale.to_s]
      if source_text.blank?
        puts "  Skipped craftjs_json text: source locale '#{source_locale}' not present"
        return nil
      end

      @issues_found += 1

      issue = {
        id: layout.id,
        node_key: node_key,
        prop: prop,
        missing_locales: missing_locales,
        empty_locales: empty_locales
      }

      modified = translate_craftjs_multiloc(multiloc, missing_locales + empty_locales, source_text)

      { issue: issue, modified: modified }
    end

    def translate_craftjs_multiloc(multiloc, locales_to_translate, source_text)
      # Count characters for locales that will actually need machine translation
      # Simulate the translation order to account for same-language copies from earlier translations
      @total_characters += count_characters_needing_translation(multiloc, locales_to_translate, source_text)

      return false unless translate_missing

      modified = false

      locales_to_translate.each do |target_locale|
        target_locale_str = target_locale.to_s
        # Check if there's a same-language translation we can copy instead of translating
        same_language = find_same_language_translation(multiloc, target_locale_str)
        if same_language
          same_lang_locale, same_lang_text = same_language
          multiloc[target_locale_str] = same_lang_text
          @translations_made += 1
          modified = true
          puts "  Copied craftjs_json text from #{same_lang_locale} to #{target_locale_str} (same language)"
        elsif Rails.env.development?
          multiloc[target_locale_str] = source_text
          @translations_made += 1
          modified = true
          puts "  Copied craftjs_json text from #{source_locale} to #{target_locale_str} (dev mode)"
        else
          translated_text = translation_service.translate(source_text, source_locale.to_s, target_locale_str)
          multiloc[target_locale_str] = translated_text
          @translations_made += 1
          modified = true
          puts "  Translated craftjs_json text from #{source_locale} to #{target_locale_str}"
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
        puts 'Nothing found to translate.'
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
