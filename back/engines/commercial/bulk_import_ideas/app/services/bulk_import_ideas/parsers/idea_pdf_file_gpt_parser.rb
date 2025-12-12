# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaPdfFileGPTParser < IdeaPdfFileParser
    # NEW VERSION USING GPT
    # Returns an array of idea rows compatible with IdeaImporter
    # Only one row ever returned as only one PDF per idea is parsed by this service
    def parse_rows(file)
      # NEW USING GPT
      # TODO: Will this work with AWS S3?
      file_path = file.file.file.file
      gpt_service = BulkImportIdeas::Parsers::Pdf::GPTFormParser.new(@phase, @locale)
      form_parsed_idea = gpt_service.parse_idea(file_path, template_data[:page_count])

      @raw_idea_data << form_parsed_idea # Logging raw data for debugging later if needed
      [idea_to_idea_row(form_parsed_idea, file)]
    end

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
  end
end
