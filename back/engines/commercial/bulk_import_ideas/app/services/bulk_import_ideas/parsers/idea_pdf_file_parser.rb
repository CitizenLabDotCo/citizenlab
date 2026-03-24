# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaPdfFileParser
    IDEAS_PER_JOB = 5

    def initialize(current_user, locale, phase_id, personal_data_enabled, pages_per_form: nil)
      @import_user = current_user
      @phase = Phase.find(phase_id)
      @project = @phase.project
      @locale = locale || AppConfiguration.instance.settings('core', 'locales').first
      @personal_data_enabled = personal_data_enabled
      @pages_per_form = pages_per_form
      @row_mapper = IdeaRowMapper.new(phase: @phase, project: @project, locale: @locale, personal_data_enabled: @personal_data_enabled)
    end

    def parse_rows(file)
      llm_parser = BulkImportIdeas::Parsers::Pdf::LLMFormParser.new(@phase, @locale, personal_data_enabled: @personal_data_enabled)
      form_parsed_idea = llm_parser.parse_idea(file.file, file.num_pages)

      file.update!(parsed_value: { parser: 'claude', value: form_parsed_idea })

      [idea_to_idea_row(form_parsed_idea, file)]
    end

    # Asynchronous version of the parse_file method
    # Sends 5 files containing 1 idea to each job
    def parse_file_async(file_content)
      files = create_files file_content
      job_ids = []
      job_first_idea_index = 1
      files.each_slice(IDEAS_PER_JOB) do |sliced_files|
        job = BulkImportIdeas::IdeaPdfImportJob.perform_later(sliced_files, @import_user, @locale, @phase, @personal_data_enabled, job_first_idea_index)
        job_ids << job.job_id
        job_first_idea_index += IDEAS_PER_JOB
      end

      job_ids
    end

    def idea_to_idea_row(idea, file, index: 0)
      fields = idea[:fields]
      page_range = idea[:pdf_pages]
      return nil if @row_mapper.idea_blank?(fields)

      idea_row = @row_mapper.build_base_idea_row(fields: fields, file: file, index: index, page_range: page_range)
      structured_fields = structure_raw_fields(fields)
      idea_row = @row_mapper.process_user_details(structured_fields, idea_row)
      merged_fields = merge_idea_with_form_fields(structured_fields)
      @row_mapper.process_custom_form_fields(merged_fields, idea_row)
    end

    private

    def structure_raw_fields(idea)
      idea.map { |name, value| { name: name, value: value } }
    end

    def merge_idea_with_form_fields(idea_fields)
      merged_fields = []
      form_fields = template_data[:fields].deep_dup
      form_fields.each do |form_field|
        next unless form_field[:type] == 'field'

        idea_field = idea_fields.find { |f| f[:name] == form_field[:key] }
        next unless idea_field && idea_field[:value].present?

        new_field = form_field
        new_field[:value] = idea_field[:value]
        new_field = @row_mapper.process_field_value(new_field, form_fields) unless new_field[:input_type] == 'matrix_linear_scale'
        merged_fields << new_field
        idea_fields.delete_at(idea_fields.index { |f| f.equal?(idea_field) })
      end
      merged_fields
    end

    def create_files(file_content)
      source_file = @row_mapper.upload_source_file(file_content)
      splitter = Pdf::PdfFileSplitter.new(project: @project, pages_per_form: @pages_per_form)
      splitter.split(source_file)
    end

    def template_data
      @template_data ||= begin
        custom_field_service = CustomFieldService.new
        importable_fields = IdeaCustomFieldsService.new(@phase.pmethod.custom_form).printable_fields.select(&:supports_pdf_import?)

        fields = importable_fields.map do |field|
          {
            name: custom_field_service.handle_title(field, @locale),
            type: 'field',
            input_type: field[:input_type],
            code: field[:code],
            key: field[:key],
            parent_key: nil
          }
        end
        options = importable_fields.flat_map do |field|
          field.options.select { |o| o.custom_field.supports_pdf_import? }.map do |option|
            {
              name: custom_field_service.handle_title(option, @locale),
              type: 'option',
              input_type: 'option',
              code: option[:code],
              key: option[:key],
              parent_key: field[:key]
            }
          end
        end

        { fields: fields + options }
      end
    end
  end
end
