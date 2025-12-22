# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaPdfFileGPTParser < IdeaPdfFileParser
    # NEW VERSION USING GPT
    # Returns an array of idea rows compatible with IdeaImporter
    # Only one row ever returned as only one PDF per idea is parsed by this service
    def parse_rows(file)
      gpt_service = BulkImportIdeas::Parsers::Pdf::GPTFormParser.new(@phase, @locale)
      form_parsed_idea = gpt_service.parse_idea(file.file, template_data[:page_count])

      # Store the parsed idea for better analysis later
      file.update!(parsed_value: { parser: 'gpt', value: form_parsed_idea })

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

    def template_data
      @template_data ||= BulkImportIdeas::Parsers::Pdf::IdeaPdfTemplateReader.new(@phase, @locale, @personal_data_enabled, gpt_parser: true).template_data
    end
  end
end
