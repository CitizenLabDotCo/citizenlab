# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class LLMFormParser
    def initialize(phase, locale)
      @phase = phase
      @locale = locale
    end

    # Return in format compatible with idea_to_idea_row
    def parse_idea(file_uploader, page_count)
      parsed_response = parse(file_uploader)

      fields = if parsed_response.present?
        parsed_response
          .select { |r| r.is_a?(Hash) && r['text'].present? }
          .map { |r| { r['text'] => r['answer'] } }
          .reduce({}, :merge)
      else
        {}
      end

      {
        pdf_pages: (1..page_count).to_a,
        fields: fields
      }
    end

    private

    def parse(file_uploader)
      pdf_file = Files::File.new(
        name: 'scan.pdf',
        mime_type: 'application/pdf',
        content: file_uploader
      )

      message = Analysis::LLM::Message.new(prompt, pdf_file)
      gpt_response = llm.chat(message)

      corrected_response = gpt_response.match(/\[.+\]/m)&.try(:[], 0) # to be sure it is json that can be parsed

      corrected_response.present? ? JSON.parse(corrected_response) : nil
    end

    def prompt
      ::Analysis::LLM::Prompt.new.fetch('form_sync',
        locale: @locale,
        form_schema_json: (personal_data_schema + form_schema).to_json)
    end

    # Return a simple schema to send to GPT
    def form_schema
      field_num = 0
      fields = printable_form_fields.map do |f|
        next if !f.supports_submission?

        field = {
          id: field_num += 1,
          type: f.input_type,
          text: f.title_multiloc[@locale.to_s]
        }

        if f.supports_options?
          field[:options] = f.options.map do |o|
            o.title_multiloc[@locale.to_s]
          end
        end

        if f.supports_matrix_statements?
          field[:matrix_statements] = f.matrix_statements.map.with_index do |ms, _statement_num|
            ms.title_multiloc[@locale.to_s]
          end
          field[:labels] = (1..f.maximum).map do |label_num|
            attr_name = :"linear_scale_label_#{label_num}_multiloc"
            f[attr_name][@locale.to_s]
          end.compact_blank
        end

        field
      end

      fields.compact
    end

    def personal_data_schema
      organization_name = AppConfiguration.instance.settings('core', 'organization_name')[@locale]
      [{
        id: 0,
        type: 'text',
        optional: true,
        text: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') }
      },
        {
          id: 0,
          type: 'text',
          optional: true,
          text: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') }
        },
        {
          id: 0,
          type: 'text',
          optional: true,
          text: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
        },
        {
          id: 0,
          type: 'checkbox',
          optional: true,
          text: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.by_checking_this_box', organizationName: organization_name) }
        }]
    end

    def llm
      @llm ||= LLMSelector.new.llm_class_for_use_case('form_sync').new
    end

    def printable_form_fields
      @printable_form_fields ||= IdeaCustomFieldsService.new(@phase.pmethod.custom_form).printable_fields
    end
  end
end
