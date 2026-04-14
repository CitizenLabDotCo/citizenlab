# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaXlsxFileParser
    MAX_ROWS_PER_XLSX = 50

    attr_reader :row_mapper

    def initialize(current_user, locale, phase_id, personal_data_enabled, pages_per_form: nil)
      @import_user = current_user
      @phase = Phase.find(phase_id)
      @project = @phase.project
      @locale = locale || AppConfiguration.instance.settings('core', 'locales').first
      @personal_data_enabled = personal_data_enabled
      @row_mapper = IdeaRowMapper.new(phase: @phase, project: @project, locale: @locale, personal_data_enabled: @personal_data_enabled, strategy: self)
    end

    def parse_file(file_content)
      files = create_files(file_content)

      idea_rows = []
      files.each do |file|
        idea_rows += parse_rows(file)
      end
      idea_rows
    end

    def parse_rows(file)
      xlsx_ideas = parse_xlsx_ideas(file).map { |idea| { pdf_pages: [1], fields: idea } }
      @row_mapper.ideas_to_idea_rows(xlsx_ideas, file)
    end

    # Asynchronous version of the parse_file method
    # Sends 1 XSLX file containing 50 ideas to each job
    def parse_file_async(file_content)
      files = create_files file_content

      job_ids = []
      job_first_idea_index = 2 # First row is the header
      files.each do |file|
        job = BulkImportIdeas::IdeaXlsxImportJob.perform_later([file], @import_user, @locale, @phase, @personal_data_enabled, job_first_idea_index)
        job_ids << job.job_id
        job_first_idea_index += MAX_ROWS_PER_XLSX
      end

      job_ids
    end

    # Strategy methods called by IdeaRowMapper

    def structure_raw_fields(fields)
      index = 0
      fields.map do |name, value|
        name = Export::Xlsx::Utils.new.remove_duplicate_column_name_suffix name
        {
          name: name,
          value: value,
          type: 'field',
          page: 1,
          position: index += 1
        }
      end
    end

    def merge_idea_with_form_fields(idea)
      merged_idea = []
      form_fields = template_data[:fields].deep_dup
      form_fields.each do |form_field|
        idea.each do |idea_field|
          if form_field[:name] == idea_field[:name] && (form_field[:type] == 'field')
            new_field = form_field
            new_field[:value] = idea_field[:value]
            new_field = @row_mapper.process_field_value(new_field, form_fields)
            merged_idea << new_field
            idea.delete_if { |f| f == idea_field }
            break
          end
        end
      end
    end

    def extract_matrix_value(field)
      return nil if field[:value].blank?

      multiloc_service = MultilocService.new
      matrix_field = CustomField.find_by(key: field[:key])

      label_values = (1..matrix_field.maximum).each_with_object({}) do |i, res|
        label_attr = :"linear_scale_label_#{i}_multiloc"
        label = I18n.with_locale(@locale) { multiloc_service.t(matrix_field[label_attr]) }
        res[label] = i if label.present?
      end

      statement_keys = matrix_field.matrix_statements.each_with_object({}) do |statement, res|
        statement_title = I18n.with_locale(@locale) { multiloc_service.t(statement.title_multiloc) }
        res[statement_title] = statement.key if statement_title.present?
      end

      # Extract the matrix value from the string
      field[:value].split(';').each_with_object({}) do |statement, res|
        key, val = statement.split(':').map(&:strip)
        key = statement_keys[key]
        val = label_values[val]
        res[key] = val.to_i if key && val
      end
    end

    private

    def create_files(file_content)
      source_file = @row_mapper.upload_source_file(file_content)

      # Split into multiple XLSX files with 50 ideas each
      split_xlsx_files = XlsxService.new.split_xlsx(source_file.file.read, MAX_ROWS_PER_XLSX)
      split_xlsx_files.map.with_index do |xlsx_file, index|
        base64_xlsx_file = Base64.encode64(xlsx_file.string)
        BulkImportIdeas::IdeaImportFile.create!(
          import_type: 'xlsx',
          project: @project,
          parent: source_file,
          file_by_content: {
            name: "import_#{index}.xlsx",
            content: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base64_xlsx_file}"
          }
        )
      end
    end

    def parse_xlsx_ideas(file)
      # Empty cells are included so we get all form fields per idea - this is important for 'other' fields that have the same header
      XlsxService.new.xlsx_to_hash_array(
        file.file.read,
        include_empty_cells: true,
        rich_text_columns: rich_text_column_headers
      )
    end

    # The description cell can contain formatting (bold/italic/etc) that we want
    # to preserve as HTML — body_multiloc stores HTML downstream.
    def rich_text_column_headers
      description_field = template_data[:fields].find { |f| f[:code] == 'body_multiloc' }
      description_field ? [description_field[:name]] : []
    end

    def template_data
      @template_data ||= BulkImportIdeas::Exporters::IdeaXlsxFormExporter.new(@phase, @locale, @personal_data_enabled).importer_data
    end
  end
end
