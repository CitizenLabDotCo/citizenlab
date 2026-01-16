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
    # Load all models including those in engines
    Zeitwerk::Loader.eager_load_all

    # Parse arguments
    translate_missing_locales = args[:translate].to_s.downcase == 'true'
    translation_service = MachineTranslations::MachineTranslationService.new if translate_missing_locales

    # Validate host parameter (required to prevent accidental runs on all tenants)
    if args[:host].blank?
      puts 'Host parameter is required. Usage: rake demos:translate_missing_locales[host,translate]'
      next
    end

    tenant = Tenant.find_by(host: args[:host])

    if tenant.nil?
      puts "Tenant not found: #{args[:host]}"
      next
    end

    # Switch to tenant context
    tenant.switch do
      puts "\n#{'=' * 80}"
      puts "Tenant: #{tenant.host}"
      puts '=' * 80

      # Get configured locales for this tenant
      locales = AppConfiguration.instance.settings('core', 'locales')

      if locales.blank?
        puts 'No locales configured in settings. Skipping.'
        next
      end

      main_locale = locales.first
      lifecycle_stage = AppConfiguration.instance.settings('core', 'lifecycle_stage')
      is_demo = lifecycle_stage == 'demo'

      # Only allow translations on demo platforms (or local dev) to prevent accidental changes to production data
      if translate_missing_locales && !is_demo && !Rails.env.development?
        puts "ERROR: Translations can only be run on demo platforms (current: #{lifecycle_stage})"
        puts 'Run without the translate flag to audit only.'
        next
      end

      puts "Configured locales: #{locales.join(', ')} (main: #{main_locale})"
      puts "Lifecycle stage: #{lifecycle_stage}"
      puts "Translate missing: #{translate_missing_locales}"
      puts '-' * 80

      # Initialize counters
      issues_found = 0
      translations_made = 0
      total_characters = 0
      model_summary = {}

      # Helper lambda to process a multiloc value within craftjs_json
      # Returns a hash with :has_issues, :missing_locales, :empty_locales, :characters, :translations_made
      process_craftjs_multiloc = lambda do |multiloc|
        missing = []
        empty = []

        locales.each do |locale|
          if !multiloc.key?(locale)
            missing << locale
          elsif multiloc[locale].blank?
            empty << locale
          end
        end

        result = {
          has_issues: missing.any? || empty.any?,
          missing_locales: missing,
          empty_locales: empty,
          characters: 0,
          translations_made: 0
        }

        next result unless result[:has_issues]

        # Find source locale for translation
        source_locale = if multiloc[main_locale].present?
          main_locale
        else
          multiloc.find { |_, v| v.present? }&.first
        end

        next result unless source_locale

        source_text = multiloc[source_locale]
        locales_to_translate = missing + empty

        result[:characters] = source_text.to_s.length * locales_to_translate.size

        next result unless translate_missing_locales

        locales_to_translate.each do |target_locale|
          if Rails.env.development?
            multiloc[target_locale] = source_text
            result[:translations_made] += 1
            puts "  Copied craftjs_json text from #{source_locale} to #{target_locale} (dev mode)"
          else
            translated_text = translation_service.translate(source_text, source_locale, target_locale)
            multiloc[target_locale] = translated_text
            result[:translations_made] += 1
            puts "  Translated craftjs_json text from #{source_locale} to #{target_locale}"
          end
        rescue StandardError => e
          puts "  ERROR translating craftjs_json text to #{target_locale}: #{e.message}"
        end

        result
      end

      # Iterate through all models
      Cl2DataListingService.new.cl2_schema_models.each do |model|
        # Find columns that store multiloc data (JSON with locale keys)
        multiloc_columns = data_listing_service.multiloc_attributes(model)
        next if multiloc_columns.empty?

        model_issues = []

        # Process each record in batches
        model.find_each do |record|
          # Skip readonly records (e.g., database views like Moderation::Moderation)
          next if record.readonly?

          multiloc_columns.each do |column|
            value = record.send(column)

            # Skip nil, empty, or all-blank multilocs
            next if value.blank? || value.values.all?(&:blank?)

            # Check which locales are missing or empty
            missing_locales = []
            empty_locales = []

            locales.each do |locale|
              if !value.key?(locale)
                missing_locales << locale
              elsif value[locale].blank?
                empty_locales << locale
              end
            end

            # Skip if all configured locales have content
            next if missing_locales.empty? && empty_locales.empty?

            # Record the issue
            issue = {
              id: record.id,
              column: column,
              missing_locales: missing_locales,
              empty_locales: empty_locales
            }
            model_issues << issue
            issues_found += 1

            # Find source locale for translation (prefer main locale, fallback to any available)
            source_locale = if value[main_locale].present?
              main_locale
            else
              value.find { |_, v| v.present? }&.first
            end

            # Skip if no source content available
            next unless source_locale

            source_text = value[source_locale]
            locales_to_translate = missing_locales + empty_locales

            # Count characters for cost estimation (source length × number of target locales)
            total_characters += source_text.to_s.length * locales_to_translate.size

            # Skip actual translation if not requested
            next unless translate_missing_locales

            # Translate to each missing/empty locale
            locales_to_translate.each do |target_locale|
              if Rails.env.development?
                # In development, just copy the source text (no API calls)
                value[target_locale] = source_text
                translations_made += 1
                puts "  Copied #{model.name}##{record.id}.#{column} from #{source_locale} to #{target_locale} (dev mode)"
              else
                # In production/staging, use Google Translate
                translated_text = translation_service.translate(source_text, source_locale, target_locale)
                value[target_locale] = translated_text
                translations_made += 1
                puts "  Translated #{model.name}##{record.id}.#{column} from #{source_locale} to #{target_locale}"
              end
            rescue StandardError => e
              puts "  ERROR translating #{model.name}##{record.id}.#{column} to #{target_locale}: #{e.message}"
            end

            # Save the updated multiloc (bypasses validations/callbacks)
            record.update_column(column, value)
          end
        end

        # Skip models with no issues
        next if model_issues.empty?

        # Track issues per model for summary
        model_summary[model.name] = model_issues.size

        # Print detailed issues for this model
        puts "\n#{model.name} (#{model_issues.size} issues)"
        puts '-' * 40

        model_issues.each do |issue|
          messages = []
          messages << "missing: #{issue[:missing_locales].join(', ')}" if issue[:missing_locales].any?
          messages << "empty: #{issue[:empty_locales].join(', ')}" if issue[:empty_locales].any?

          puts "  ID: #{issue[:id]} | #{issue[:column]} | #{messages.join(' | ')}"
        end
      end

      # Process craftjs_json text values in ContentBuilder::Layout records
      # These contain nested multiloc values within TextMultiloc and AccordionMultiloc nodes
      if defined?(ContentBuilder::Layout)
        craftjs_issues = []

        ContentBuilder::Layout.find_each do |layout|
          craftjs_json = layout.craftjs_json
          next if craftjs_json.blank?

          layout_modified = false

          craftjs_json.each do |node_key, node_value|
            next unless node_value.is_a?(Hash)
            next unless node_value['type'].is_a?(Hash)

            resolved_name = node_value['type']['resolvedName']
            next unless ContentBuilder::Layout::TEXT_CRAFTJS_NODE_TYPES.include?(resolved_name)

            # Process 'text' prop (present in both TextMultiloc and AccordionMultiloc)
            text_multiloc = node_value.dig('props', 'text')
            if text_multiloc.is_a?(Hash) && text_multiloc.values.any?(&:present?)
              result = process_craftjs_multiloc.call(text_multiloc)
              if result[:has_issues]
                craftjs_issues << {
                  id: layout.id,
                  node_key: node_key,
                  prop: 'text',
                  missing_locales: result[:missing_locales],
                  empty_locales: result[:empty_locales]
                }
                issues_found += 1
                total_characters += result[:characters]
                translations_made += result[:translations_made]
                layout_modified = true if result[:translations_made] > 0
              end
            end

            # Process 'title' prop (only in AccordionMultiloc)
            next unless resolved_name == 'AccordionMultiloc'

            title_multiloc = node_value.dig('props', 'title')
            next unless title_multiloc.is_a?(Hash) && title_multiloc.values.any?(&:present?)

            result = process_craftjs_multiloc.call(title_multiloc)
            next unless result[:has_issues]

            craftjs_issues << {
              id: layout.id,
              node_key: node_key,
              prop: 'title',
              missing_locales: result[:missing_locales],
              empty_locales: result[:empty_locales]
            }
            issues_found += 1
            total_characters += result[:characters]
            translations_made += result[:translations_made]
            layout_modified = true if result[:translations_made] > 0
          end

          # Save the updated craftjs_json if any translations were made
          layout.update_column(:craftjs_json, craftjs_json) if layout_modified
        end

        # Report craftjs_json issues
        unless craftjs_issues.empty?
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
      end

      # Print summary
      puts "\n#{'=' * 80}"
      puts "SUMMARY FOR #{tenant.host}"
      puts '=' * 80

      if model_summary.empty?
        puts 'No issues found.'
      else
        # Print issue counts per model, sorted by count descending
        puts "\n#{'Model'.ljust(40)} | Count"
        puts '-' * 50

        model_summary.sort_by { |_, count| -count }.each do |model_name, count|
          puts "#{model_name.ljust(40)} | #{count}"
        end

        puts '-' * 50
        puts "#{'Total'.ljust(40)} | #{issues_found}"

        # Print character count (useful for estimating translation costs)
        formatted_chars = total_characters.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
        puts "\nCharacters #{translate_missing_locales ? 'translated' : 'to translate'}: #{formatted_chars}"
        puts "Translations made: #{translations_made}" if translate_missing_locales
      end
    end
  end
end
