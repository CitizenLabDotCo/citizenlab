# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaPdfFileParser < IdeaBaseFileParser
    IDEAS_PER_JOB = 2
    POSITION_TOLERANCE = 10
    MAX_TOTAL_PAGES = 50
    TEXT_FIELD_TYPES = %w[text multiline_text text_multiloc html_multiloc]

    def initialize(current_user, locale, phase_id, personal_data_enabled)
      super
      @form_fields = IdeaCustomFieldsService.new(Factory.instance.participation_method_for(@phase).custom_form).printable_fields
    end

    # Asynchronous version of the parse_file method
    def parse_file(file_content)
      files = create_files file_content

      files.each_slice(IDEAS_PER_JOB) do |sliced_files|
        BulkImportIdeas::IdeaPdfImportJob.perform_later(sliced_files, @import_user, @locale, @phase, @personal_data_enabled)
      end

      [] # Return an empty ideas_rows array as files are processed in jobs
    end

    def parse_rows(file)
      pdf_file = file.file.read

      # NOTE: We return both parsed values so we can merge the best values from both
      form_parsed_ideas = google_forms_service.parse_pdf(pdf_file, import_form_data[:page_count])
      text_parsed_ideas = begin
        Pdf::IdeaPlainTextParserService.new(
          @phase || @project,
          @form_fields,
          @locale,
          import_form_data[:page_count]
        ).parse_text(google_forms_service.raw_text_page_array(pdf_file))
      rescue BulkImportIdeas::Error
        []
      end

      idea_rows = merge_pdf_rows(form_parsed_ideas, text_parsed_ideas, file)
      idea_rows_with_corrected_texts(idea_rows)
    end

    private

    def create_files(file_content)
      source_file = upload_source_file file_content

      # Split a pdf into one document per idea
      split_pdf_files = []
      if source_file&.import_type == 'pdf'
        # Get number of pages in a form from the exported PDF template
        pages_per_idea = import_form_data[:page_count]

        pdf = begin
          ::CombinePDF.parse source_file.file.read
        rescue ::CombinePDF::ParsingError
          raise BulkImportIdeas::Error.new 'bulk_import_malformed_pdf', value: source_file.file_content_url
        end

        source_file.update!(num_pages: pdf.pages.count)
        raise BulkImportIdeas::Error.new 'bulk_import_maximum_pdf_pages_exceeded', value: MAX_TOTAL_PAGES if pdf.pages.count > MAX_TOTAL_PAGES

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
    def merge_idea_with_form_fields(idea_fields)
      merged_fields = []
      form_fields = import_form_data[:fields]
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
      # Truncate the checkbox label for better multiline checkbox detection
      permission_checkbox_label = (I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.by_checking_this_box') })[0..30]
      checkbox = idea.select { |key, value| key.match(/^#{permission_checkbox_label}/) && value == 'filled_checkbox' }
      if checkbox != {}
        locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
        idea[locale_permission_label] = 'X'
        idea.delete(checkbox.first.first) # Remove the original field TODO: JS - Better way of doing this?
      end
      idea
    end

    def merge_pdf_rows(form_parsed_ideas, text_parsed_ideas, file)
      form_parsed_idea_rows = ideas_to_idea_rows(form_parsed_ideas, file)
      text_parsed_idea_rows = ideas_to_idea_rows(text_parsed_ideas, file)

      return form_parsed_idea_rows unless form_parsed_idea_rows.count == text_parsed_idea_rows.count

      form_parsed_idea_rows.each_with_index.map do |idea, index|
        idea[:custom_field_values] = text_parsed_idea_rows[index][:custom_field_values].merge(idea[:custom_field_values])
        idea[:pdf_pages] = complete_page_range(idea[:pdf_pages], text_parsed_idea_rows[index][:pdf_pages])
        text_parsed_idea_rows[index].merge(idea)
      end
    end

    def process_field_value(field, form_fields)
      field = super field, form_fields

      if TEXT_FIELD_TYPES.include?(field[:input_type]) && field[:value]
        # Strip out text that has leaked from the field description into the value
        field[:value] = field[:value].gsub(/#{field[:description]}/, '')

        # Strip out out any text that has leaked from the next questions title into the value
        next_question = form_fields[form_fields.find_index(field) + 1]
        if next_question && next_question[:name].split.count > 4
          field[:value] = field[:value].gsub(/#{next_question[:name]}*/, '')
        end

        # Strip out 'this answer may be shared with moderators...' text
        this_answer_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.this_answer') }
        field[:value] = field[:value].gsub(/\*#{this_answer_copy}/, '')

        field[:value] = field[:value].strip
      end

      field
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

    def google_forms_service
      @google_forms_service ||= Pdf::IdeaGoogleFormParserService.new
    end

    def idea_rows_with_corrected_texts(idea_rows)
      corrector = BulkImportIdeas::Parsers::Pdf::GPTTextCorrector.new(@phase, idea_rows)
      corrector.correct
    end
  end
end
