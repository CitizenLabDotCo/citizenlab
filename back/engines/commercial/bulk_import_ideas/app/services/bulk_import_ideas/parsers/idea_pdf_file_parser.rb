# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaPdfFileParser < IdeaBaseFileParser
    IDEAS_PER_JOB = 5
    POSITION_TOLERANCE = 10
    MAX_TOTAL_PAGES = 100
    TEXT_FIELD_TYPES = %w[text multiline_text text_multiloc html_multiloc]

    # Synchronous version not implemented for PDFs
    def parse_file(file_content)
      raise NotImplementedError, 'This method is not implemented for PDFs'
    end

    # Asynchronous version of the parse_file method
    # Sends 5 files containing 1 idea to each job
    def parse_file_async(file_content)
      files = create_files file_content

      job_ids = []
      job_first_idea_index = 1
      files.each_slice(IDEAS_PER_JOB) do |sliced_files|
        job = BulkImportIdeas::IdeaImportJob.perform_later(self.class, sliced_files, @import_user, @locale, @phase, @personal_data_enabled, job_first_idea_index)
        job_ids << job.job_id
        job_first_idea_index += IDEAS_PER_JOB
      end

      job_ids
    end

    def parse_rows(file)
      pdf_file = file.file.read

      # NOTE: We return both parsed values so we can merge the best values from both
      google_forms_service = Pdf::IdeaGoogleFormParserService.new
      form_parsed_idea = google_forms_service.parse_pdf(pdf_file)
      text_parsed_idea = begin
        Pdf::IdeaPlainTextParserService.new(
          printable_form_fields,
          @locale
        ).parse_text(google_forms_service.raw_text_page_array(pdf_file))
      rescue BulkImportIdeas::Error
        []
      end

      [merge_parsed_ideas_into_idea_row(form_parsed_idea, text_parsed_idea, file)]
    end

    private

    def create_files(file_content)
      source_file = upload_source_file file_content

      # Split a pdf into one PDF per idea
      split_pdf_files = []
      if source_file&.import_type == 'pdf'
        # Get number of pages in a form from the exported PDF template
        pages_per_idea = import_form_data[:page_count]

        pdf = begin
          ::CombinePDF.parse source_file.file.read
        rescue ::CombinePDF::ParsingError
          raise BulkImportIdeas::Error.new 'bulk_import_malformed_pdf', value: source_file.file_content_url
        end

        source_file_page_count = pdf.pages.count
        source_file.update!(num_pages: source_file_page_count)
        raise BulkImportIdeas::Error.new 'bulk_import_maximum_pdf_pages_exceeded', value: MAX_TOTAL_PAGES if source_file_page_count > MAX_TOTAL_PAGES
        raise BulkImportIdeas::Error.new 'bulk_import_not_enough_pdf_pages', value: source_file_page_count if source_file_page_count < pages_per_idea

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

    # Overridden from base class to handle the way checkboxes are filled in the PDF
    # and detect fields from description as well as title
    # @param [Array<Hash>] idea_fields - comes from IdeaBaseFileParser#structure_raw_fields
    def merge_idea_with_form_fields(idea_fields)
      merged_fields = []
      form_fields = import_form_data[:fields].deep_dup # Array<Hash> comes from IdeaPdfFormExporter#add_to_importer_fields
      form_fields.each do |form_field|
        idea_fields.each do |idea_field|
          if form_field[:name] == idea_field[:name] || form_field[:description] == idea_field[:name]
            if form_field[:type] == 'field' && idea_field[:value].present?
              new_field = form_field
              new_field[:value] = idea_field[:value]
              new_field = process_field_value(new_field, form_fields)
              merged_fields << new_field
              idea_fields.delete_if { |f| f == idea_field }
              break
            elsif idea_field[:value] == 'filled_checkbox' && form_field[:page] == idea_field[:page]
              # Check that the value is near to the position on the page it should be
              if idea_field[:position].between?(form_field[:position].to_i - POSITION_TOLERANCE, form_field[:position].to_i + POSITION_TOLERANCE)
                select_field = merged_fields.find { |f| f[:key] == form_field[:parent_key] } || form_fields.find { |f| f[:key] == form_field[:parent_key] }.clone
                select_field[:value] = select_field[:value] ? select_field[:value] << form_field[:key] : [form_field[:key]]
                merged_fields << select_field
                idea_fields.delete_if { |f| f == idea_field }
                form_fields.delete_if { |f| f == idea_field } if select_field[:input_type] == 'select'
                break
              end
            end
          end
        end
      end
      merged_fields
    end

    # Overridden from base class to tidy data returned from PDF
    def structure_raw_fields(idea)
      locale_optional_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }
      idea = extract_permission_checkbox(idea)
      idea.map do |name, value|
        option = name.match(/(.*)_(\d*).(\d*).(\d{2})/) # Is this an option (checkbox)?
        {
          name: option ? option[1] : name.gsub("(#{locale_optional_label})", '').squish,
          value: value,
          type: value.to_s.include?('checkbox') ? 'option' : 'field',
          page: option ? option[2].to_i : nil,
          position: option ? option[4].to_i : nil
        }
      end
    end

    def extract_permission_checkbox(idea)
      # Truncate the checkbox label and downcase for better multiline checkbox detection
      permission_checkbox_label = (I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.by_checking_this_box') })[0..30]
      checkbox = idea.select { |key, value| key.downcase.match(/^#{permission_checkbox_label.downcase}/) && value == 'filled_checkbox' }
      if checkbox != {}
        locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
        idea[locale_permission_label] = 'X'
        idea.delete(checkbox.first.first) # Remove the original field
      end
      idea
    end

    def merge_parsed_ideas_into_idea_row(form_parsed_idea, text_parsed_idea, file)
      form_parsed_idea_row = idea_to_idea_row(form_parsed_idea, file)
      text_parsed_idea_row = idea_to_idea_row(text_parsed_idea, file)
      return form_parsed_idea_row if text_parsed_idea_row.blank?

      # Merge the core fields and prefer the form parsed values
      merged_row = text_parsed_idea_row.merge(form_parsed_idea_row)

      # Merge the custom field values of only select fields
      # 1. For most fields prefer the text parsed value
      custom_field_values = form_parsed_idea_row[:custom_field_values].merge(text_parsed_idea_row[:custom_field_values])

      # 2. If multi select (array) combine the two sets of values
      custom_field_values = custom_field_values.to_h do |name, value|
        if value.is_a?(Array)
          value += form_parsed_idea_row[:custom_field_values][name] || [] # Add nothing if not present
          value.uniq!
        end
        [name, value]
      end
      merged_row[:custom_field_values] = custom_field_values

      # Get the complete PDF page range - although should always be the same
      merged_row[:pdf_pages] = complete_page_range(form_parsed_idea_row[:pdf_pages], text_parsed_idea_row[:pdf_pages])
      merged_row
    end

    # @param [Hash] field - comes from IdeaPdfFormExporter#add_to_importer_fields
    # @param [Array<Hash>] form_fields - comes from IdeaPdfFormExporter#add_to_importer_fields
    def process_field_value(field, form_fields)
      processed_field = super

      if TEXT_FIELD_TYPES.include?(processed_field[:input_type]) && processed_field[:value]
        # Strip out text that has leaked from the field description and name into the value
        processed_field[:value] = processed_field[:value].gsub(/#{processed_field[:description]}/, '')
        processed_field[:value] = processed_field[:value].gsub(/\A\s*#{processed_field[:name]}/, '')

        # Strip out out any text that has leaked from the next questions title into the value
        next_question = form_fields[form_fields.find_index(processed_field) + 1]
        if next_question && next_question[:name].split.count > 4
          processed_field[:value] = processed_field[:value].gsub(/#{next_question[:name]}*/, '')
        end

        # Strip out text from unsupported fields that might come next
        if field[:next_page_split_text]
          split_string = processed_field[:value].split(field[:next_page_split_text])
          processed_field[:value] = split_string[0] if split_string.count > 1
        end

        # Strip out 'this answer may be shared with moderators...' text
        this_answer_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.this_answer') }
        processed_field[:value] = processed_field[:value].gsub(/\*#{this_answer_copy}/, '')

        processed_field[:value] = processed_field[:value].strip
      end

      processed_field
    end

    def complete_page_range(pages1, pages2)
      min = [pages1.min, pages2.min].min
      max = [pages1.max, pages2.max].max
      (min..max).to_a
    end

    # Return the fields and page count from the form we're importing from
    def import_form_data
      @import_form_data ||= BulkImportIdeas::Exporters::IdeaPdfFormExporter.new(@phase, @locale, @personal_data_enabled).importer_data
    end

    def printable_form_fields
      @printable_form_fields ||= IdeaCustomFieldsService.new(@phase.pmethod.custom_form).printable_fields_legacy
    end
  end
end
