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
  task :test_pdf_import, %i[fixtures_path] => [:environment] do |_t, args|
    raise 'This task can only be run in the development environment' unless Rails.env.development?

    fixtures_base_path = args[:fixtures_path] || 'tmp/test_pdf_import'

    tenant = Tenant.find_by(host: 'localhost')
    raise 'Tenant not found for host: localhost' unless tenant

    puts "Running PDF import test on tenant: #{tenant.host}"
    puts "Fixtures path: #{fixtures_base_path}"
    puts '=' * 80

    tenant.switch do
      # Use the first admin user for the import
      admin_user = User.admin.order(:created_at).first

      # Define parsers to test
      parsers = [
        { name: 'GPT Parser', class: BulkImportIdeas::Parsers::IdeaPdfFileGPTParser },
        { name: 'Google Document AI Parser', class: BulkImportIdeas::Parsers::IdeaPdfFileParser }
      ]

      # User fields to check
      user_fields = [
        [:user_first_name, 'First Name'],
        [:user_last_name, 'Last Name'],
        [:user_email, 'Email']
      ]

      # Find all example folders in the fixtures path
      fixtures_root = Rails.root.join(fixtures_base_path)
      example_folders = Dir.glob(fixtures_root.join('*')).select { |f| File.directory?(f) }.sort

      if example_folders.empty?
        puts "No example folders found in #{fixtures_root}"
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
          puts "  SKIPPED: schema.json not found"
          next
        end

        unless File.exist?(pdf_path)
          puts "  SKIPPED: form.pdf not found"
          next
        end

        # Load schema and extract locale, custom_fields, and participation_method
        schema_json = JSON.parse(File.read(schema_path))

        unless schema_json['parse'] == true
          puts "  SKIPPED: parse is not true in schema.json"
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

        # Create a project and phase for this example
        project = Project.create!(
          title_multiloc: { locale => "PDF Import Test - #{example_name}" },
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

        # Transform the custom fields
        custom_fields_params = BulkImportPdfTestHelpers.transform_schema_to_params(custom_fields_data)

        # Import the custom fields using UpdateAllService
        params = ActionController::Parameters.new(custom_fields: custom_fields_params).permit!
        service = IdeaCustomFields::UpdateAllService.new(custom_form, params, admin_user)
        result = service.update_all

        unless result.success?
          puts "  ERROR: Failed to import custom fields: #{result.errors}"
          project.destroy!
          next
        end

        puts "Imported #{result.fields.count} custom fields"

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
          puts "  expected_output.json not found - will generate from first parser"
          first_parser = parsers.first
          file_parser = first_parser[:class].new(admin_user, locale, phase.id, false)
          idea_rows = file_parser.parse_rows(idea_import_file)
          idea = idea_rows.first

          if idea.nil?
            puts "  ERROR: No idea parsed from PDF - cannot generate expected_output.json"
            project.destroy!
            next
          end

          # Create expected_output.json from parsed idea
          # TODO: Change this template for ideation
          expected_output_data = {
            user_first_name: idea[:user_first_name],
            user_last_name: idea[:user_last_name],
            user_email: idea[:user_email],
            custom_field_values: idea[:custom_field_values] || {}
          }

          File.write(expected_output_path, JSON.pretty_generate(expected_output_data))
          puts "  Generated expected_output.json from #{first_parser[:name]}"
          puts "  SKIPPED comparisons - please review and edit expected_output.json manually"

          project.destroy!
          next
        end

        # Load expected output
        expected_output = JSON.parse(File.read(expected_output_path)).deep_symbolize_keys

        # Build lookup hash of custom fields by key for display names
        custom_fields_by_key = custom_form.custom_fields.index_by(&:key)

        # Load existing log and add ALL entries to grand_results for averaging
        log_path = fixtures_path.join('log.json')
        existing_log = File.exist?(log_path) ? JSON.parse(File.read(log_path)) : []

        # Add all existing log entries to grand_results (for all versions)
        existing_log.each do |entry|
          entry_data = entry.deep_symbolize_keys.merge(example: example_name, locale: locale)
          grand_results << entry_data
          puts "  Loaded from log: #{entry['parser']} v#{entry['parser_version']} - Score: #{entry['score']&.round(2)}%"
        end

        # Run test for each parser
        parsers.each do |parser_info|
          parser_version = parser_info[:class].respond_to?(:version) ? parser_info[:class].version : 'N/A'

          # Skip if already tested this parser class and version
          already_tested = existing_log.any? do |entry|
            entry['parser_class'] == parser_info[:class].name &&
              entry['parser_version'] == parser_version
          end

          if already_tested
            puts "\n  PARSER: #{parser_info[:name]} v#{parser_version} - SKIPPED (already in log)"
            next
          end

          puts "\n  PARSER: #{parser_info[:name]}"
          puts '  ' + ('-' * 40)

          begin
            # Parse the PDF file
            start_time = Time.current
            file_parser = parser_info[:class].new(admin_user, locale, phase.id, false)
            idea_rows = file_parser.parse_rows(idea_import_file)
            parse_duration = Time.current - start_time

            idea = idea_rows.first
            if idea.nil?
              puts "    ERROR: No idea parsed from PDF"
              grand_results << {
                example: example_name,
                locale: locale,
                parser: parser_info[:name],
                parser_class: parser_info[:class].name,
                parser_version: parser_version,
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

              # Handle _other fields - use parent field's title and 'text' input type
              if field_key_str.end_with?('_other')
                parent_key = field_key_str.sub(/_other$/, '')
                parent_field = custom_fields_by_key[parent_key]
                display_name = parent_field ? "#{parent_field.title_multiloc[locale] || parent_key} (Other)" : field_key_str
                input_type = 'text'
              else
                custom_field = custom_fields_by_key[field_key_str]
                display_name = custom_field ? (custom_field.title_multiloc[locale] || field_key_str) : field_key_str
                input_type = custom_field&.input_type || 'unknown'
              end

              if actual_value == expected_value
                num_correct += 1
              else
                incorrect_fields << { field: display_name, key: field_key, input_type: input_type, expected: expected_value, actual: actual_value }
                puts "    [FAIL] #{display_name}: expected '#{expected_value}', got '#{actual_value}'"
              end
            end

            # Calculate score
            score = (num_correct.to_f / num_fields) * 100.0

            grand_results << {
              example: example_name,
              locale: locale,
              parser: parser_info[:name],
              parser_class: parser_info[:class].name,
              parser_version: parser_version,
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
              parser_version: parser_version,
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

        example_results.each do |result|
          # Skip if this parser class + version already exists in the log
          already_in_log = existing_log.any? do |entry|
            entry['parser_class'] == result[:parser_class] &&
              entry['parser_version'] == result[:parser_version]
          end
          next if already_in_log

          log_entry = result.except(:example).merge(tested_at: Time.current.iso8601)
          log_entry = log_entry.transform_keys(&:to_s)
          existing_log << log_entry
          new_results_added = true
          puts "    Logged result for #{result[:parser]} v#{result[:parser_version]}"
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

        puts format('  %-25s v%-10s | %9.2f%% | %11.2fs | %d/%d (%d examples)',
                    parser_name, version, avg_score, avg_time, total_correct, total_fields, results.count)
      end
      puts '=' * 105

      # Create xlsx file from all results
      xlsx_path = fixtures_root.join('results.xlsx')
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
        sheet.add_row ['Example', 'Parser', 'Field', 'Key', 'Input Type', 'Expected', 'Actual']

        grand_results.each do |r|
          next unless r[:incorrect_fields].present?

          r[:incorrect_fields].each do |field|
            field = field.transform_keys(&:to_sym) if field.is_a?(Hash)
            sheet.add_row [
              r[:example],
              r[:parser],
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

# Helper module for the rake task
module BulkImportPdfTestHelpers
  module_function

  def transform_schema_to_params(schema)
    schema.each_with_index.map do |field, index|
      field_params = field.except('id').merge('temp_id' => "temp-#{index}")

      if field['options'].present?
        field_params['options'] = field['options'].each_with_index.map do |option, opt_index|
          option.except('id').merge('temp_id' => "temp-opt-#{index}-#{opt_index}")
        end
      end

      if field['matrix_statements'].present?
        field_params['matrix_statements'] = field['matrix_statements'].map do |statement|
          statement.except('id')
        end
      end

      field_params
    end
  end
end
