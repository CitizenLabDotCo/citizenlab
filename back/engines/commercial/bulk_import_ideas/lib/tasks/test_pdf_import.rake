# frozen_string_literal: true

# Usage:
#   rake 'bulk_import:test_pdf_import'
#   rake 'bulk_import:test_pdf_import[engines/commercial/bulk_import_ideas/spec/llm/fixtures]'
#
# This task tests the PDF import pipeline by:
#   1. Looping over all example folders in the fixtures path
#   2. For each example: reading locale and custom_fields from schema.json
#   3. Creating a native survey phase with a custom form
#   4. Importing custom fields from schema.json
#   5. Parsing the PDF file using both the GPT parser and the standard parser
#   6. Comparing parsed results against expected output
#   7. Reporting accuracy scores for all parsers across all examples
#   8. Generating results.xlsx with Results, Incorrect Fields, and Averages sheets
#
# Expected schema.json format:
#   {
#     "locale": "en",
#     "custom_fields": [...]
#   }

namespace :bulk_import do
  desc 'Test PDF import parsing accuracy against expected output'
  task :test_pdf_import, %i[test_data_path] => [:environment] do |_t, args|
    raise 'This task can only be run in the development environment' unless Rails.env.development?

    # Suppress all the database activity for clarity
    Rails.logger.level = :fatal
    ActiveRecord::Base.logger.level = :fatal if defined?(ActiveRecord::Base)
    ActionView::Base.logger.level = :fatal if defined?(ActionView::Base)

    # NOTE: The default path is created by passing in the test data repo as a volume when running the task via docker
    # eg docker compose run -v /path/to/local/formsync_test_data:/formsync_test_data --rm web rails bulk_import:test_pdf_import
    test_data_base_path = args[:test_data_path] || '/formsync_test_data'

    tenant = Tenant.find_by(host: 'localhost')
    raise 'Tenant not found for host: localhost' unless tenant

    puts "Running PDF import test on tenant: #{tenant.host}"
    puts "Fixtures path: #{test_data_base_path}"
    puts '=' * 80

    tenant.switch do
      # Use the first admin user for the import
      admin_user = User.admin.order(:created_at).first

      # Define parsers to test with versions
      # increment version when parser logic changes to test examples with new version
      parsers = [
        { name: 'GPT Parser', class: BulkImportIdeas::Parsers::IdeaPdfFileLLMParser, llm: 'gpt', version: 'gpt_v1' },
        { name: 'Gemini Parser', class: BulkImportIdeas::Parsers::IdeaPdfFileLLMParser, llm: 'gemini', version: 'gemini_v1' },
        { name: 'Google Document AI Parser', class: BulkImportIdeas::Parsers::IdeaPdfFileParser, version: 'document_ai_v1' }
      ]

      # User fields to check
      user_fields = [
        [:user_first_name, 'First Name'],
        [:user_last_name, 'Last Name'],
        [:user_email, 'Email']
      ]

      # Find all example folders in the fixtures path
      data_root = Rails.root.join("#{test_data_base_path}/test_data")
      example_folders = Dir.glob(data_root.join('*')).select { |f| File.directory?(f) }.sort

      if example_folders.empty?
        puts "No example folders found in #{data_root}"
        next
      end

      puts "Found #{example_folders.count} example folder(s): #{example_folders.map { |f| File.basename(f) }.join(', ')}"

      # Store all results across all examples
      grand_results = []

      # Process each example folder
      example_folders.each do |example_folder|
        example_name = File.basename(example_folder)
        fixtures_path = Pathname.new(example_folder)

        puts "\n#{'#' * 80}"
        puts "EXAMPLE: #{example_name}"
        puts '#' * 80

        # Check required files exist
        schema_path = fixtures_path.join('schema.json')
        pdf_path = fixtures_path.join('form.pdf')
        expected_output_path = fixtures_path.join('expected_output.json')

        unless File.exist?(schema_path)
          puts '  SKIPPED: schema.json not found'
          next
        end

        unless File.exist?(pdf_path)
          puts '  SKIPPED: form.pdf not found'
          next
        end

        # Load schema and extract locale, custom_fields, and participation_method
        schema_json = JSON.parse(File.read(schema_path))
        unless schema_json['parse'] == true
          puts '  SKIPPED: parse is not true in schema.json'
          next
        end

        locale = schema_json['locale']
        custom_fields_data = schema_json['custom_fields']
        participation_method = schema_json['participation_method'] || 'native_survey'

        unless locale && custom_fields_data
          puts "  SKIPPED: schema.json must contain 'locale' and 'custom_fields' attributes"
          next
        end

        puts "  Locale: #{locale}"
        puts "  Participation method: #{participation_method}"

        # Load existing log to check if all parsers already tested
        log_path = fixtures_path.join('log.json')
        existing_log = File.exist?(log_path) ? JSON.parse(File.read(log_path)) : []

        # Check if all parsers have already been tested for their current versions
        all_parsers_tested = parsers.all? do |parser_info|
          existing_log.any? do |entry|
            entry['parser_class'] == parser_info[:class].name &&
              entry['parser_version'] == parser_info[:version]
          end
        end

        if all_parsers_tested
          puts '  All parsers already tested - loading results from log'
          # Add all existing log entries to grand_results
          existing_log.each do |entry|
            entry_data = entry.deep_symbolize_keys.merge(example: example_name, locale: locale)
            grand_results << entry_data
          end
          next
        end

        # Add all existing log entries to grand_results (for versions not being tested)
        existing_log.each do |entry|
          entry_data = entry.deep_symbolize_keys.merge(example: example_name, locale: locale)
          grand_results << entry_data
          puts "  Loaded from log: #{entry['parser']} #{entry['parser_version']} - Score: #{entry['score']&.round(2)}%"
        end

        # Create a project and phase for this example
        project = Project.create!(
          title_multiloc: { locale => "PDF Import Test - #{example_name}" }
          # admin_publication_attributes: { publication_status: 'published' }
        )

        phase_attrs = {
          project:,
          participation_method:,
          title_multiloc: { locale => 'PDF Import Phase' },
          start_at: Time.zone.today - 7.days
        }

        # Add native survey specific attributes
        if participation_method == 'native_survey'
          phase_attrs[:native_survey_title_multiloc] = { locale => 'Survey' }
          phase_attrs[:native_survey_button_multiloc] = { locale => 'Take the survey' }
        end

        phase = Phase.create!(phase_attrs)

        participation_context = participation_method == 'ideation' ? project : phase
        custom_form = CustomForm.create!(participation_context:)
        puts "  Created project/phase/form for #{example_name}"

        # Import the custom fields using UpdateAllService
        # Need to shape them as though they came from params or we get errors
        params = ActionController::Parameters.new(custom_fields: custom_fields_data).permit!
        service = IdeaCustomFields::UpdateAllService.new(custom_form, admin_user, custom_fields: params[:custom_fields])
        result = service.update_all

        unless result.success?
          puts "  ERROR: Failed to import custom fields: #{result.errors}"
          project.destroy!
          next
        end

        puts "  Imported #{result.fields.count} custom fields"

        # Create an IdeaImportFile with the PDF content
        pdf_content = File.read(pdf_path)
        base64_content = Base64.encode64(pdf_content)
        idea_import_file = BulkImportIdeas::IdeaImportFile.create!(
          import_type: 'pdf',
          project: project,
          file_by_content: {
            name: 'import.pdf',
            content: "data:application/pdf;base64,#{base64_content}"
          }
        )

        # Check if expected_output.json exists - if not, generate it from first parser
        generate_expected_output = !File.exist?(expected_output_path)
        if generate_expected_output
          puts '  expected_output.json not found - will generate from first parser'
          first_parser = parsers.first
          file_parser = first_parser[:class].new(admin_user, locale, phase.id, false, llm: first_parser[:llm])
          idea_rows = file_parser.parse_rows(idea_import_file)
          idea = idea_rows.first

          if idea.nil?
            puts '  ERROR: No idea parsed from PDF - cannot generate expected_output.json'
            project.destroy!
            next
          end

          # Build lookup of custom fields by key for select/multiselect option replacement
          fields_by_key = custom_form.custom_fields.includes(:options).index_by(&:key)
          select_input_types = %w[select multiselect]

          # Create custom_field_values with select/multiselect replaced by all option keys
          custom_field_values = {}
          (idea[:custom_field_values] || {}).each do |field_key, value|
            field = fields_by_key[field_key.to_s]

            custom_field_values[field_key] = if field && select_input_types.include?(field.input_type)
              # Replace with array of all option keys to make it easier to edit expected output
              field.options.map(&:key)
            else
              value
            end
          end

          # Create expected_output.json from parsed idea
          expected_output_data = {
            user_first_name: idea[:user_first_name],
            user_last_name: idea[:user_last_name],
            user_email: idea[:user_email],
            custom_field_values: custom_field_values
          }
          if participation_method == 'ideation'
            expected_output_data[:title_multiloc] = idea[:title_multiloc] || { locale => '' }
            expected_output_data[:body_multiloc] = idea[:body_multiloc] || { locale => '' }
          end

          File.write(expected_output_path, JSON.pretty_generate(expected_output_data))
          puts "  Generated expected_output.json from #{first_parser[:name]}"
          puts '  SKIPPED comparisons - please review and edit expected_output.json manually'

          project.destroy!
          next
        end

        # Load expected output
        expected_output = JSON.parse(File.read(expected_output_path)).deep_symbolize_keys

        # Build lookup hash of custom fields by key for display names
        custom_fields_by_key = custom_form.custom_fields.index_by(&:key)

        # TODO: Different match methods for different input types
        # multiselect - partial if one found out of many - no match if more found than are selected
        # matrix - partial if some statements match - as a percentage of the total statements
        # ranking - values must match exactly including order

        # Match scores for comparison
        match_scores = { exact: 1, partial: 0.5, none: 0 }

        # Run test for each parser
        parsers.each do |parser_info|
          # Skip if already tested this parser class and version
          already_tested = existing_log.any? do |entry|
            entry['parser_class'] == parser_info[:class].name &&
              entry['parser_version'] == parser_info[:version]
          end

          if already_tested
            puts "\n  PARSER: #{parser_info[:name]} #{parser_info[:version]} - SKIPPED (already in log)"
            next
          end

          puts "\n  PARSER: #{parser_info[:name]}"
          puts "  #{'-' * 40}"

          begin
            # Parse the PDF file
            start_time = Time.current
            file_parser = parser_info[:class].new(admin_user, locale, phase.id, false)
            idea_rows = file_parser.parse_rows(idea_import_file)
            parse_duration = Time.current - start_time

            idea = idea_rows.first
            if idea.nil?
              puts '    ERROR: No idea parsed from PDF'
              grand_results << {
                example: example_name,
                locale: locale,
                parser: parser_info[:name],
                parser_class: parser_info[:class].name,
                parser_version: parser_info[:version],
                score: 0,
                parse_time: parse_duration,
                error: 'No idea parsed'
              }
              next
            end

            # Compare results
            num_fields = expected_output[:custom_field_values].length + 3 # 3 user fields
            num_correct = 0
            incorrect_fields = []

            # Check user fields
            user_fields.each do |field_key, field_label|
              expected = expected_output[field_key]
              actual = idea[field_key]
              if actual == expected
                num_correct += 1
              else
                incorrect_fields << { field: field_label, key: field_key, input_type: 'text', expected: expected, actual: actual }
                puts "    [FAIL] #{field_label}: expected '#{expected}', got '#{actual}'"
              end
            end

            # Check custom field values
            expected_output[:custom_field_values].each do |field_key, expected_value|
              actual_value = idea[:custom_field_values]&.[](field_key)
              field_key_str = field_key.to_s
              custom_field = custom_fields_by_key[field_key_str]

              # Handle _other fields - use parent field's title and 'text' input type
              if field_key_str.end_with?('_other')
                parent_key = field_key_str.sub(/_other$/, '')
                parent_field = custom_fields_by_key[parent_key]
                display_name = parent_field ? "#{parent_field.title_multiloc[locale] || parent_key} (Other)" : field_key_str
                input_type = 'select_other'
              else
                display_name = custom_field ? (custom_field.title_multiloc[locale] || field_key_str) : field_key_str
                input_type = custom_field&.input_type || 'unknown'
              end

              # Calculate match: :exact, :partial, or :none
              match_type = :none
              if actual_value == expected_value
                match_type = :exact
              elsif input_type == 'select_other' || custom_field&.supports_text?
                # For text fields consider it a partial match if fuzzy match
                stripped_actual = actual_value.to_s.strip.downcase.gsub(/[[:punct:]]/, '')
                stripped_expected = expected_value.to_s.strip.downcase.gsub(/[[:punct:]]/, '')
                if stripped_actual == stripped_expected ||
                   (stripped_actual.present? && stripped_expected.present? &&
                    (stripped_actual.length - stripped_expected.length).abs <= 5)
                  match_type = :partial
                end
              end

              match_score = match_scores[match_type]
              num_correct += match_score
              if match_type != :exact
                match_label = match_type == :partial ? 'PARTIAL' : 'FAIL'
                incorrect_fields << { field: display_name, key: field_key, input_type: input_type, expected: expected_value, actual: actual_value, match_type: match_label }
                puts "    [#{match_label}] #{display_name}: expected '#{expected_value}', got '#{actual_value}'"
              end
            end

            # Calculate score
            score = (num_correct.to_f / num_fields) * 100.0

            grand_results << {
              example: example_name,
              locale: locale,
              parser: parser_info[:name],
              parser_class: parser_info[:class].name,
              parser_version: parser_info[:version],
              score: score,
              parse_time: parse_duration,
              correct: num_correct,
              total: num_fields,
              incorrect_fields: incorrect_fields
            }

            puts "    Score: #{score.round(2)}% (#{num_correct}/#{num_fields}) in #{parse_duration.round(2)}s"
          rescue StandardError => e
            parse_duration = Time.current - start_time if start_time
            puts "    ERROR: #{e.message}"
            grand_results << {
              example: example_name,
              locale: locale,
              parser: parser_info[:name],
              parser_class: parser_info[:class].name,
              parser_version: parser_info[:version],
              score: 0,
              parse_time: parse_duration || 0,
              error: e.message
            }
          end
        end

        # Cleanup - delete test project for this example
        project.destroy!

        # Write only NEW results for this example to log.json (skip entries already in log)
        example_results = grand_results.select { |r| r[:example] == example_name }
        new_results_added = false

        example_results.each do |example_result|
          # Skip if this parser class + version already exists in the log
          already_in_log = existing_log.any? do |entry|
            entry['parser_class'] == example_result[:parser_class] &&
              entry['parser_version'] == example_result[:parser_version]
          end
          next if already_in_log

          log_entry = example_result.except(:example).merge(tested_at: Time.current.iso8601)
          log_entry = log_entry.transform_keys(&:to_s)
          existing_log << log_entry
          new_results_added = true
          puts "    Logged result for #{example_result[:parser]} #{example_result[:parser_version]}"
        end

        File.write(log_path, JSON.pretty_generate(existing_log)) if new_results_added
      end

      # Display grand summary across all examples and parsers
      puts "\n#{'=' * 105}"
      puts 'GRAND SUMMARY'
      puts '=' * 105
      puts format('%-20s | %-25s | %10s | %12s | %s', 'Example', 'Parser', 'Score', 'Parse Time', 'Correct/Total')
      puts '-' * 105
      grand_results.each do |r|
        if r[:error]
          puts format('%-20s | %-25s | %10s | %12s | %s', r[:example], r[:parser], 'ERROR', "#{r[:parse_time].round(2)}s", r[:error])
        else
          puts format('%-20s | %-25s | %9.2f%% | %11.2fs | %d/%d', r[:example], r[:parser], r[:score], r[:parse_time], r[:correct], r[:total])
        end
      end
      puts '-' * 105

      # Calculate and display averages per parser and version
      parser_version_groups = grand_results.reject { |r| r[:error] }.group_by { |r| [r[:parser], r[:parser_version]] }
      averages = []

      puts "\nAVERAGES BY PARSER AND VERSION:"
      parser_version_groups.each do |(parser_name, version), results|
        avg_score = results.sum { |r| r[:score] } / results.count
        avg_time = results.sum { |r| r[:parse_time] } / results.count
        total_correct = results.sum { |r| r[:correct] }
        total_fields = results.sum { |r| r[:total] }
        parser_class = results.first[:parser_class]

        averages << {
          parser: parser_name,
          parser_class: parser_class,
          parser_version: version,
          avg_score: avg_score,
          avg_time: avg_time,
          total_correct: total_correct,
          total_fields: total_fields,
          example_count: results.count
        }

        puts format('  %-25s %-10s | %9.2f%% | %11.2fs | %d/%d (%d examples)',
          parser_name, version, avg_score, avg_time, total_correct, total_fields, results.count)
      end
      puts '=' * 105

      # Create xlsx file from all results
      xlsx_path = Rails.root.join("#{test_data_base_path}/results.xlsx")
      package = Axlsx::Package.new
      workbook = package.workbook

      # Results sheet
      workbook.add_worksheet(name: 'Results') do |sheet|
        # Header row
        sheet.add_row ['Example', 'Locale', 'Parser', 'Parser Class', 'Parser Version', 'Score %', 'Parse Time (s)', 'Correct', 'Total', 'Tested At', 'Error']

        grand_results.each do |r|
          sheet.add_row [
            r[:example],
            r[:locale],
            r[:parser],
            r[:parser_class],
            r[:parser_version],
            r[:error] ? nil : r[:score]&.round(2),
            r[:parse_time]&.round(2),
            r[:correct],
            r[:total],
            Time.current.iso8601,
            r[:error]
          ]
        end
      end

      # Incorrect fields sheet
      workbook.add_worksheet(name: 'Incorrect Fields') do |sheet|
        sheet.add_row ['Example', 'Parser', 'Match', 'Field', 'Key', 'Input Type', 'Expected', 'Actual']

        grand_results.each do |r|
          next if r[:incorrect_fields].blank?

          r[:incorrect_fields].each do |field|
            field = field.transform_keys(&:to_sym) if field.is_a?(Hash)
            sheet.add_row [
              r[:example],
              r[:parser],
              field[:match_type] || 'FAIL',
              field[:field],
              field[:key],
              field[:input_type],
              field[:expected].to_s,
              field[:actual].to_s
            ]
          end
        end
      end

      # Averages sheet
      workbook.add_worksheet(name: 'Averages') do |sheet|
        sheet.add_row ['Parser', 'Parser Class', 'Parser Version', 'Avg Score %', 'Avg Parse Time (s)', 'Total Correct', 'Total Fields', 'Example Count']

        averages.each do |avg|
          sheet.add_row [
            avg[:parser],
            avg[:parser_class],
            avg[:parser_version],
            avg[:avg_score].round(2),
            avg[:avg_time].round(2),
            avg[:total_correct],
            avg[:total_fields],
            avg[:example_count]
          ]
        end
      end

      package.serialize(xlsx_path.to_s)
      puts "\nResults saved to: #{xlsx_path}"
    end
  end
end
