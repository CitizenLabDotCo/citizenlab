# frozen_string_literal: true

module BulkImportIdeas
  class ImportProjectIdeasService < ImportIdeasService
    PAGES_TO_TRIGGER_NEW_PDF = 8
    MAX_TOTAL_PAGES = 50
    POSITION_TOLERANCE = 10

    def initialize(current_user, project_id, locale, phase_id, personal_data_enabled)
      super(current_user)
      @project = Project.find(project_id)
      @phase = phase_id ? @project.phases.find(phase_id) : TimelineService.new.current_phase(@project)
      @participation_method = Factory.instance.participation_method_for(@phase || @project)
      @form_fields = IdeaCustomFieldsService.new(@participation_method.custom_form).importable_fields
      @locale = locale || @locale
      @google_forms_service = nil
      @input_form_data = import_form_data(personal_data_enabled)
    end

    def generate_example_xlsx
      locale_first_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') }
      locale_last_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') }
      locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      locale_published_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.date_published') }

      columns = {
        locale_first_name_label => 'Bill',
        locale_last_name_label => 'Test',
        locale_email_label => 'bill@citizenlab.co',
        locale_permission_label => 'X',
        locale_published_label => '18-07-2022'
      }

      @form_fields.each do |field|
        column_name = field.title_multiloc[@locale]
        value = case field.input_type
        when 'select'
          field.options.first.title_multiloc[@locale]
        when 'multiselect'
          field.options.map { |o| o.title_multiloc[@locale] }.join '; '
        when 'topic_ids'
          @project.allowed_input_topics.map { |t| t.title_multiloc[@locale] }.join '; '
        when 'number'
          5
        else
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        end
        columns[column_name] = value
      end

      unless @participation_method.supports_survey_form?
        locale_image_url_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.image_url') }
        locale_latitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.latitude') }
        locale_longitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.longitude') }

        columns[locale_image_url_label] = 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_in_meeting_graphic.png'
        columns[locale_latitude_label] = 50.5035
        columns[locale_longitude_label] = 6.0944
      end

      XlsxService.new.hash_array_to_xlsx [columns]
    end

    def create_files(file_content)
      source_file = upload_source_file file_content

      # Split a pdf into smaller documents
      split_pdf_files = []
      if source_file&.import_type == 'pdf'
        # Get number of pages in a form from the download
        pages_per_idea = @input_form_data[:page_count]

        pdf = ::CombinePDF.parse open(source_file.file_content_url).read
        source_file.update!(num_pages: pdf.pages.count)
        raise Error.new 'bulk_import_ideas_maximum_pdf_pages_exceeded', value: pdf.pages.count if pdf.pages.count > MAX_TOTAL_PAGES

        return [source_file] if pdf.pages.count <= PAGES_TO_TRIGGER_NEW_PDF # Only need to split if the file is too big

        new_pdf = ::CombinePDF.new
        new_pdf_count = 0
        pdf.pages.each_with_index do |page, index|
          new_pdf << page
          current_page_num = index + 1
          save_to_file =
            (current_page_num % pages_per_idea == 0 && new_pdf.pages.count >= PAGES_TO_TRIGGER_NEW_PDF) ||
            (current_page_num == pdf.pages.count)

          if save_to_file
            # TODO: Would be better to send the new_pdf directly to IdeaImportFile, but doesn't seem possible
            # Is all this file opening going to cause issues on S3?
            # Create an io object here?
            new_pdf_count += 1
            file = Rails.root.join('tmp', "import_#{source_file.id}_#{new_pdf_count}.pdf")
            new_pdf.save file.to_s
            base_64_content = Base64.encode64 file.read
            file.delete

            split_pdf_files << IdeaImportFile.create!(
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
      split_pdf_files.presence || [source_file]
    end

    def parse_idea_rows(file)
      if file.import_type == 'pdf'
        parsed_ideas = parse_pdf_ideas(file)
        merge_pdf_rows(parsed_ideas)
      else
        xlsx_ideas = parse_xlsx_ideas(file).map { |idea| { pdf_pages: [1], fields: idea } }
        ideas_to_idea_rows(xlsx_ideas)
      end
    end

    private

    def ideas_to_idea_rows(ideas_array)
      idea_rows = ideas_array.each_with_index.map do |idea, index|
        page_range = idea[:pdf_pages]
        fields = idea[:fields]

        next if idea_blank? fields

        idea_row = {}

        # Fields not in the idea/survey form
        locale_published_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.date_published') }
        locale_image_url_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.image_url') }
        locale_latitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.latitude') }
        locale_longitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.longitude') }
        locale_tags_label = I18n.with_locale(@locale) { I18n.t('custom_fields.ideas.topic_ids.title') }

        idea_row[:id]           = index + 1
        idea_row[:project_id]   = @project.id
        idea_row[:phase_id]     = @phase.id if @phase
        idea_row[:pdf_pages]    = page_range
        idea_row[:published_at] = fields[locale_published_label]
        idea_row[:image_url]    = fields[locale_image_url_label]
        idea_row[:latitude]     = fields[locale_latitude_label]
        idea_row[:longitude]    = fields[locale_longitude_label]
        idea_row[:topic_titles] = (fields[locale_tags_label] || '').split(';').map(&:strip).select(&:present?)

        fields = clean_field_names(fields)
        idea_row = process_user_details(fields, idea_row)
        idea_row = process_custom_form_fields(fields, idea_row)

        idea_row
      end
      idea_rows.compact
    end

    def merge_pdf_rows(parsed_ideas)
      form_parsed_ideas = ideas_to_idea_rows(parsed_ideas[:form_parsed_ideas])
      text_parsed_ideas = ideas_to_idea_rows(parsed_ideas[:text_parsed_ideas])

      return form_parsed_ideas unless form_parsed_ideas.count == text_parsed_ideas.count

      form_parsed_ideas.each_with_index.map do |idea, index|
        idea[:custom_field_values] = text_parsed_ideas[index][:custom_field_values].merge(idea[:custom_field_values])
        text_parsed_ideas[index].merge(idea)
      end
    end

    def parse_pdf_ideas(file)
      pdf_file = open(file.file_content_url, &:read)
      @google_forms_service ||= GoogleFormParserService.new

      # NOTE: We return both parsed values so we can later merge the best values from both
      form_parsed_ideas = @google_forms_service.parse_pdf(pdf_file, @input_form_data[:page_count])

      text_parsed_ideas = begin
        IdeaPlaintextParserService.new(
          @phase || @project,
          @form_fields.reject { |field| field.input_type == 'topic_ids' }, # Temp
          @locale,
          @input_form_data[:page_count]
        ).parse_text(@google_forms_service.raw_text_page_array(pdf_file))
      rescue BulkImportIdeas::Error
        []
      end

      {
        form_parsed_ideas: form_parsed_ideas,
        text_parsed_ideas: text_parsed_ideas
      }
    end

    # Match all fields in the forms field with values returned by parser / xlsx sheet
    def process_custom_form_fields(idea, idea_row)
      # Merge the form fields with the import values into a single array
      merged_idea = []
      form_fields = @input_form_data[:fields]
      form_fields.each do |form_field|
        idea.each do |idea_field|
          if form_field[:name] == idea_field[:name]
            if form_field[:type] == 'field'
              new_field = form_field
              new_field[:value] = idea_field[:value]
              new_field = process_field_value(new_field, form_fields)
              merged_idea << new_field
              # TODO: Delete field from both?
              idea.delete_if { |f| f == idea_field }
              break
            elsif idea_field[:value] == 'filled_checkbox' && form_field[:page] == idea_field[:page]
              # Check that the value is near to the position on the page it should be
              if idea_field[:position].between?(form_field[:position].to_i - POSITION_TOLERANCE, form_field[:position].to_i + POSITION_TOLERANCE)
                select_field = merged_idea.find { |f| f[:key] == form_field[:parent_key] } || form_fields.find { |f| f[:key] == form_field[:parent_key] }
                select_field[:value] = select_field[:value] ? select_field[:value] << form_field[:key] : [form_field[:key]]
                merged_idea << select_field
                idea.delete_if { |f| f == idea_field }
                form_fields.delete_if { |f| f == idea_field } if select_field[:input_type] == 'select'
                break
              end
            end
          end
        end
      end

      # Now add to the idea row
      custom_fields = {}
      merged_idea.each do |field|
        next if field[:key].nil?

        if field[:code]
          # Core fields
          idea_row[field[:code].to_sym] = field[:input_type].include?('multiloc') ? { @locale.to_sym => field[:value] } : field[:value]
        else
          # Custom fields
          value = field[:value]
          value = field[:value].first if field[:input_type] == 'select'
          custom_fields[field[:key].to_sym] = value if value.present?
        end
      end
      idea_row[:custom_field_values] = custom_fields

      idea_row
    end

    def process_field_value(field, form_fields)
      if %w[select multiselect].include?(field[:input_type]) && field[:value]
        values = field[:value].is_a?(Array) ? field[:value] : field[:value].split(';')
        if values.count > 0
          options = values.map do |value|
            option = form_fields.find { |f| f[:parent_key] == field[:key] && f[:name] == value.strip }
            option[:key] if option
          end
          field[:value] = options
        end
      elsif field[:input_type] == 'number'
        field[:value] = field[:value].to_i
      end
      field
    end

    def clean_field_names(idea)
      locale_optional_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }
      idea = extract_permission_checkbox(idea)
      idea.map do |name, value|
        option = name.match(/(.*)_(\d).(\d{2})/) # Is this an option (checkbox)?
        {
          name: option ? option[1] : name.gsub("(#{locale_optional_label})", '').squish,
          value: value,
          type: value.to_s.include?('checkbox') ? 'option' : 'field',
          page: option ? option[2].to_i : nil,
          position: option ? option[3].to_i : nil
        }
      end
    end

    def extract_permission_checkbox(idea)
      # Truncate the checkbox label for better multiline checkbox detection
      permission_checkbox_label = (I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.by_checking_this_box') })[0..30]
      checkbox = idea.select { |key, value| key.match(/^#{permission_checkbox_label}/) && value == 'filled_checkbox' }
      idea['Permission'] = 'X' if checkbox != {}
      idea
    end

    def process_user_details(doc, idea_row)
      # Do not add any personal details if 'Permission' field is not present or blank
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      permission = doc.find { |f| f[:name] == locale_permission_label }
      idea_row[:user_consent] = permission && permission[:value].present?
      if idea_row[:user_consent]
        locale_first_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') }
        first_name = doc.find { |f| f[:name] == locale_first_name_label }
        idea_row[:user_first_name] = first_name[:value] if first_name

        locale_last_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') }
        last_name = doc.find { |f| f[:name] == locale_last_name_label }
        idea_row[:user_last_name] = last_name[:value] if last_name

        # Ignore any emails that don't validate
        locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
        email = doc.find { |f| f[:name] == locale_email_label }
        idea_row[:user_email] = email[:value] if email && email[:value].match(User::EMAIL_REGEX)
      end

      idea_row
    end

    # Return the fields and page count to import data to
    def import_form_data(personal_data_enabled)
      # TODO: If this is an xlsx import then it just needs the fields direct from custom fields
      PrintCustomFieldsService.new(@phase || @project, @form_fields, @locale, personal_data_enabled).importer_data
    end
  end
end
