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
      @row_mapper = IdeaRowMapper.new(phase: @phase, project: @project, locale: @locale, personal_data_enabled: @personal_data_enabled, strategy: self)
    end

    def parse_rows(file)
      claude_service = BulkImportIdeas::Parsers::Pdf::LLMFormParser.new(@phase, @locale, llm_class: Analysis::LLM::ClaudeSonnet46)
      form_parsed_idea = claude_service.parse_idea(file.file, file.num_pages)

      file.update!(parsed_value: { parser: 'claude', value: form_parsed_idea })

      [@row_mapper.idea_to_idea_row(form_parsed_idea, file)]
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

    # Strategy methods called by IdeaRowMapper
    def structure_raw_fields(idea)
      idea = extract_permission_checkbox(idea)
      idea.map do |name, value|
        {
          name: name,
          value: value,
          type: 'field',
          page: 1,
          position: nil
        }
      end
    end

    def merge_idea_with_form_fields(idea_fields)
      merged_fields = []
      form_fields = template_data[:fields].deep_dup
      form_fields.each do |form_field|
        next unless form_field[:type] == 'field'

        idea_field = idea_fields.find { |f| f[:name] == form_field[:name] || form_field[:description] == f[:name] }
        next unless idea_field && idea_field[:value].present?

        new_field = form_field
        new_field[:value] = idea_field[:value]
        new_field = @row_mapper.process_field_value(new_field, form_fields)
        merged_fields << new_field
        idea_fields.delete(idea_field)
      end
      merged_fields
    end

    def extract_matrix_value(field)
      return nil if field[:value].blank?

      # Swap the keys for the matrix statements to the actual field keys
      multiloc_service = MultilocService.new
      matrix_field = CustomField.find_by(key: field[:key])
      statement_keys = matrix_field.matrix_statements.each_with_object({}) do |statement, res|
        statement_title = I18n.with_locale(@locale) { multiloc_service.t(statement.title_multiloc) }
        res[statement_title] = statement.key if statement_title.present?
      end

      field[:value].transform_keys { |key| statement_keys[key] }
    end

    private

    def extract_permission_checkbox(idea)
      organization_name = AppConfiguration.instance.settings('core', 'organization_name')[@locale]
      permission_checkbox_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.by_checking_this_box', organizationName: organization_name) }
      checkbox = idea.select { |key, value| key == permission_checkbox_label && value == 'checked' }
      if checkbox != {}
        locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
        idea[locale_permission_label] = 'X'
        idea.delete(checkbox.first.first) # Remove the original field
      end
      idea
    end

    def create_files(file_content)
      source_file = @row_mapper.upload_source_file(file_content)
      splitter = Pdf::PdfFileSplitter.new(project: @project, pages_per_idea: template_data[:page_count])
      splitter.split(source_file)
    end

    # This data is a combination of the form_fields and the context of where those fields are in the PDF
    def template_data
      @template_data ||= BulkImportIdeas::Parsers::Pdf::IdeaPdfTemplateReader.new(@phase, @locale, @personal_data_enabled).template_data
    end
  end
end
