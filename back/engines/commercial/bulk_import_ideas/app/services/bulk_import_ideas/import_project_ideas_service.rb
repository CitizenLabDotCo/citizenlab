# frozen_string_literal: true

module BulkImportIdeas
  class ImportProjectIdeasService < ImportIdeasService
    PAGES_TO_TRIGGER_NEW_PDF = 8
    MAX_TOTAL_PAGES = 50

    def initialize(current_user, project_id, locale, phase_id)
      super(current_user)
      @project = Project.find(project_id)
      @phase = phase_id ? @project.phases.find(phase_id) : TimelineService.new.current_phase(@project)
      @participation_method = Factory.instance.participation_method_for(@phase || @project)
      @form_fields = IdeaCustomFieldsService.new(@participation_method.custom_form).importable_fields
      @locale = locale || @locale
      @google_forms_service = nil
    end

    def create_files(file_content)
      source_file = upload_source_file file_content

      # Split a pdf into smaller documents
      split_pdf_files = []
      if source_file&.import_type == 'pdf'
        # Get number of pages in a form from the download
        # NOTE: Page count may be different if name and email are specified - for future
        pages_per_idea = pdf_form_page_count

        pdf = ::CombinePDF.parse open(source_file.file_content_url).read
        source_file.update!(num_pages: pdf.pages.count)
        raise Error.new 'bulk_import_ideas_maximum_pdf_pages_exceeded', value: pdf.pages.count if pdf.pages.count > MAX_TOTAL_PAGES

        return [source_file] if pdf.pages.count <= PAGES_TO_TRIGGER_NEW_PDF # Only need to split if the file is too big

        new_pdf = ::CombinePDF.new
        new_pdf_count = 0
        pdf.pages.each_with_index do |page, index|
          new_pdf << page
          save_to_file =
            ((index + 1) % pages_per_idea == 0 && new_pdf.pages.count >= PAGES_TO_TRIGGER_NEW_PDF) ||
            (index + 1 == pdf.pages.count)

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

    def generate_example_xlsx
      locale_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.full_name') }
      locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      locale_published_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.date_published') }

      columns = {
        locale_name_label => 'Bill Test',
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

    def parse_idea_rows(file)
      ideas = if file.import_type == 'pdf'
        parse_pdf_ideas(file)
      else
        parse_xlsx_ideas(file).map { |idea| { pdf_pages: [1], fields: idea } }
      end
      ideas_to_idea_rows(ideas)
    end

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

    private

    # Match all fields in the custom field by the text of their label in the specified locale
    def process_custom_form_fields(doc, idea_row)
      core_field_codes = %w[title_multiloc body_multiloc location_description]
      text_field_types = %w[text multiline_text number]
      select_field_types = %w[select multiselect]

      core_fields = []
      text_fields = []
      select_fields = []
      select_options = []
      @form_fields.each do |field|
        if core_field_codes.include? field[:code]
          core_fields << { name: field[:title_multiloc][@locale], code: field[:code], type: field[:input_type] }
        elsif text_field_types.include? field[:input_type]
          text_fields << { name: field[:title_multiloc][@locale], key: field[:key], type: field[:input_type] }
        elsif select_field_types.include? field[:input_type]
          select_fields << { name: field[:title_multiloc][@locale], key: field[:key], type: field[:input_type] }
          field.options.each do |option|
            select_options << { name: option[:title_multiloc][@locale], key: option[:key], field_key: field[:key], field_type: field[:input_type] }
          end
        end
      end

      # Core fields
      idea_row = extract_core_fields idea_row, doc, core_fields

      # Custom fields
      custom_fields = {}
      custom_fields = extract_custom_text_fields custom_fields, doc, text_fields
      custom_fields = extract_custom_select_fields_from_options custom_fields, doc, select_options
      custom_fields = extract_custom_select_fields custom_fields, doc, select_fields, select_options
      idea_row[:custom_field_values] = custom_fields

      idea_row
    end

    def extract_core_fields(idea_row, doc, core_fields)
      core_fields.each do |field|
        core_field = find_field(doc, field[:name])
        if core_field
          code = field[:code]
          value = core_field[:value]
          idea_row[code.to_sym] = field[:type].include?('multiloc') ? { @locale.to_sym => value } : value
          doc.delete_if { |f| f == core_field }
        end
      end
      idea_row
    end

    # Text & Number fields
    def extract_custom_text_fields(custom_fields, doc, text_fields)
      text_fields.each do |field|
        text_field = find_field(doc, field[:name])
        if text_field
          custom_fields[field[:key].to_sym] = (field[:type] == 'number' ? text_field[:value].to_i : text_field[:value])
          doc.delete_if { |f| f == text_field }
        end
      end
      custom_fields
    end

    # Single & Multiselect fields
    def extract_custom_select_fields(custom_fields, doc, select_fields, select_options)
      select_fields.each do |field|
        select_field = find_field(doc, field[:name])
        if select_field && select_field[:value]
          values = select_field[:value].is_a?(Array) ? select_field[:value] : select_field[:value].split(';')
          if values.count > 0
            if field[:type] == 'select'
              value = values[0].strip # Only use the first value for single fields
              option = select_options.find { |f| f[:field_key] == field[:key] && f[:name] == value }
              custom_fields[field[:key].to_sym] = option[:key] if option
            else
              options = []
              values.each do |select_value|
                option = select_options.find { |f| f[:field_key] == field[:key] && f[:name] == select_value.strip }
                options << option[:key] if option
              end
              custom_fields[field[:key].to_sym] = options
            end
          end
          doc.delete_if { |f| f == select_field }
        end
      end
      custom_fields
    end

    def extract_custom_select_fields_from_options(custom_fields, doc, select_options)
      select_options.each do |option|
        option_field = find_field(doc, option[:name])
        # binding.pry
        if option_field && option_field[:value].include?('checkbox')

          # binding.pry
          field_key = option[:field_key].to_sym
          checked = option_field[:value] == 'filled_checkbox'
          if option[:field_type] == 'multiselect' && checked
            custom_fields[field_key] = custom_fields[field_key] || []
            custom_fields[field_key] << option[:key]
          elsif checked && !custom_fields[field_key]
            # Only use the first selected option for a single select
            custom_fields[field_key] = option[:key]
            # TODO: This will not work for multiple keys where the version of fields that are just key pairs and not have the x,y values in there
            # select_options.delete_if { |o| o[:key] == select_options[:key] }
          end

          doc.delete_if { |f| f == option_field }
        end
      end
      custom_fields
    end

    def find_field(doc, name)
      doc.find { |f| f[:name] == name }
    end

    def clean_field_names(idea)
      locale_optional_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }
      idea = idea.map { |k, v| { name: k, value: v } } # Temp: Need to just use in this format
      idea.map { |f| { name: f[:name].gsub("(#{locale_optional_label})", '').squish, value: f[:value], type: f[:type], page: f[:page], x: f[:x], y: f[:y] } }
    end

    def process_user_details(doc, idea_row)
      # Do not add any personal details if 'Permission' field is not present or blank
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      permission = find_field(doc, locale_permission_label)
      if permission && permission[:value].present?
        locale_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.full_name') }
        name = find_field(doc, locale_name_label)
        idea_row[:user_name] = name[:value] if name

        # Ignore any emails that don't validate
        locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
        email = find_field(doc, locale_email_label)
        idea_row[:user_email] = email[:value] if email && email[:value].match(User::EMAIL_REGEX)
      end

      idea_row
    end

    def parse_pdf_ideas(file)
      pdf_file = open(file.file_content_url, &:read)

      @google_forms_service ||= GoogleFormParserService.new
      @google_forms_service.parse_pdf(pdf_file, pdf_form_page_count)

      # NOTE: Slightly hacky way of merging values that don't exist from the form parser from the text parser
      # form_parsed_ideas = @google_forms_service.parse_pdf(pdf_file, pdf_form_page_count)
      # text_parsed_ideas = IdeaPlaintextParserService.new(
      #   @form_fields.reject { |field| field.input_type == 'topic_ids' }, # Temp
      #   @locale
      # ).parse_text(@google_forms_service.raw_text_page_array(pdf_file))
      #
      # form_parsed_ideas.each_with_index.map do |idea, index|
      #   idea[:fields] = text_parsed_ideas[index][:fields].merge(idea[:fields])
      #   idea
      # end
    end

    def pdf_form_page_count
      params = {}
      params[:locale] = @locale
      PrintCustomFieldsService.new(@phase || @project, @form_fields, params).create_pdf.page_count
    end
  end
end
