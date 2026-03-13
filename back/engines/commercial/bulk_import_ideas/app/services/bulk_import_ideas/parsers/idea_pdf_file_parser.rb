# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaPdfFileParser
    IDEAS_PER_JOB = 5
    MAX_TOTAL_PAGES = 100

    def initialize(current_user, locale, phase_id, personal_data_enabled)
      @import_user = current_user
      @phase = Phase.find(phase_id)
      @project = @phase.project
      @locale = locale || AppConfiguration.instance.settings('core', 'locales').first
      @personal_data_enabled = personal_data_enabled
      @row_mapper = IdeaRowMapper.new(phase: @phase, project: @project, locale: @locale, personal_data_enabled: @personal_data_enabled, strategy: self)
    end

    def parse_rows(file)
      claude_service = BulkImportIdeas::Parsers::Pdf::LLMFormParser.new(@phase, @locale, llm_class: Analysis::LLM::ClaudeSonnet46)
      form_parsed_idea = claude_service.parse_idea(file.file, template_data[:page_count])

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
      source_file = @row_mapper.upload_source_file file_content

      # Split a pdf into one PDF per idea
      split_pdf_files = []
      if source_file&.import_type == 'pdf'
        pdf = begin
          ::CombinePDF.parse source_file.file.read
        rescue ::CombinePDF::ParsingError
          raise BulkImportIdeas::Error.new 'bulk_import_malformed_pdf', value: source_file.file_content_url
        end

        source_file_page_count = pdf.pages.count
        source_file.update!(num_pages: source_file_page_count)
        raise BulkImportIdeas::Error.new 'bulk_import_maximum_pdf_pages_exceeded', value: MAX_TOTAL_PAGES if source_file_page_count > MAX_TOTAL_PAGES

        # Use manual override if provided, otherwise treat entire PDF as a single form
        pages_per_idea = @pages_per_form || source_file_page_count

        raise BulkImportIdeas::Error.new 'bulk_import_not_enough_pdf_pages', value: source_file_page_count if source_file_page_count < pages_per_idea
        if @pages_per_form && (source_file_page_count % pages_per_idea != 0)
          raise BulkImportIdeas::Error.new 'bulk_import_pdf_pages_not_divisible', total_pages: source_file_page_count, pages_per_form: pages_per_idea
        end

        new_pdf = ::CombinePDF.new
        new_pdf_count = 0
        pdf.pages.each_with_index do |page, index|
          new_pdf << page
          current_page_num = index + 1
          save_to_file = current_page_num % pages_per_idea == 0

          if save_to_file
            # Temporarily save to a file
            new_pdf_count += 1
            file = Rails.root.join('tmp', "import_#{source_file.id}_#{new_pdf_count}.pdf")
            new_pdf.save file.to_s
            base_64_content = Base64.encode64 file.read
            file.delete

            split_pdf_files << BulkImportIdeas::IdeaImportFile.create!(
              import_type: source_file.import_type,
              project: @project,
              num_pages: new_pdf.pages.count,
              parent: source_file,
              file_by_content: {
                name: "import_#{new_pdf_count}.pdf",
                content: "data:application/pdf;base64,#{base_64_content}"
              }
            )
            new_pdf = ::CombinePDF.new
          end
        end
      end
      split_pdf_files
    end

    # This data is a combination of the form_fields and the context of where those fields are in the PDF
    def template_data
      @template_data ||= BulkImportIdeas::Parsers::Pdf::IdeaPdfTemplateReader.new(@phase, @locale, @personal_data_enabled).template_data
    end
  end
end
