# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaXlsxFileParser
    MAX_ROWS_PER_XLSX = 50
    MULTI_VALUE_INPUT_TYPES = %w[select multiselect multiselect_image ranking].freeze

    attr_reader :row_mapper

    def initialize(current_user, locale, phase_id, personal_data_enabled, pages_per_form: nil)
      @import_user = current_user
      @phase = Phase.find(phase_id)
      @project = @phase.project
      @locale = locale || AppConfiguration.instance.settings('core', 'locales').first
      @personal_data_enabled = personal_data_enabled
      @row_mapper = IdeaRowMapper.new(phase: @phase, project: @project, locale: @locale, personal_data_enabled: @personal_data_enabled)
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
      ideas_to_idea_rows(parse_xlsx_ideas(file), file)
    end

    def ideas_to_idea_rows(ideas_array, file)
      ideas_array.each_with_index.filter_map { |idea, index| idea_to_idea_row(idea, file, index: index) }
    end

    def idea_to_idea_row(idea, file, index: 0)
      return nil if @row_mapper.idea_blank?(idea)

      idea_row = @row_mapper.build_base_idea_row(fields: idea, file: file, index: index)
      structured_fields = structure_raw_fields(idea)
      idea_row = @row_mapper.process_user_details(structured_fields, idea_row)
      merged_fields = merge_idea_with_form_fields(structured_fields)
      @row_mapper.process_custom_form_fields(merged_fields, idea_row)
    end

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

    private

    def structure_raw_fields(fields)
      fields.map do |name, value|
        { name: Export::Xlsx::Utils.new.remove_duplicate_column_name_suffix(name), value: value }
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
            new_field = normalize_field_value(new_field, form_fields)
            merged_idea << new_field
            idea.delete_at(idea.index { |f| f.equal?(idea_field) })
            break
          end
        end
      end
      merged_idea
    end

    def normalize_field_value(field, form_fields)
      if field[:input_type] == 'matrix_linear_scale'
        field[:value] = extract_matrix_value(field) if field[:value].present?
        return field
      end

      if MULTI_VALUE_INPUT_TYPES.include?(field[:input_type]) && field[:value].is_a?(String)
        field[:value] = field[:value].split(';').map(&:strip)
      end

      @row_mapper.process_field_value(field, form_fields)
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

    def parse_xlsx_ideas(file)
      # Empty cells are included so we get all form fields per idea - this is important for 'other' fields that have the same header
      XlsxService.new.xlsx_to_hash_array(file.file.read, include_empty_cells: true)
    end

    def template_data
      @template_data ||= BulkImportIdeas::Exporters::IdeaXlsxFormExporter.new(@phase, @locale, @personal_data_enabled).importer_data
    end
  end
end
