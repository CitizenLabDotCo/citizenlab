# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class LLMFormParser
    def initialize(phase, locale, llm_model_class)
      @phase = phase
      @locale = locale
      @llm_model_class = llm_model_class.new # e.g. Analysis::LLM::GPT41
    end

    # Return in format compatible with idea_to_idea_row
    def parse_idea(file_uploader, page_count)
      parsed_response = parse(file_uploader)

      {
        pdf_pages: (1..page_count).to_a,
        fields: parsed_response&.map { |r| { r['text'] => r['answer'] } }&.reduce({}, :merge)
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
      llm_response = @llm_model_class.chat(message)

      corrected_response = llm_response.match(/\[.+\]/m)&.try(:[], 0) # to be sure it is json that can be parsed

      corrected_response.present? ? JSON.parse(corrected_response) : nil
    end

    def prompt
      <<~LLM_PROMPT
        In this message is a scanned survey form that has been filled in by hand.
  
        Your task is to extract the text and checked options based on the questions in the JSON form schema below.
  
        Do not attempt to interpret or summarize the responses. Ignore any text that does not appear handwritten. Do not fill in any missing answers.
  
        Do not extract answers unless they are in the correct order in the scanned form.

        The language used in the form is #{@locale}.

        Return the same array of JSON objects in the same order, but with an additional 'answer' attribute for each question, according to the following rules:
        - if the question is a text question, add an attribute answer with the extracted handwritten text as value.
        - if the question is of type select or multiselect then return an attribute answer as an array of the checked or ticked options' text values. If no options were checked, return an empty array.
        - if the question is of type checkbox, return the answer as 'checked' if it has been checked.
        - if the question is of type linear_scale, rating or sentiment_linear_scale, return the answer as a number.
        - if the question is of type ranking, then there will be a number written in a box next to each option indicating its rank. Return the answer as an array of option texts ordered by their rank from lowest to highest. The written numbers will not be higher than the number of options.
        - if the question is of type matrix_linear_scale, then there will checkboxes in rows against a list of matrix_statements on the left hand side. Return the answer as a hash with each statement as the key and the value as the number corresponding to the order (starting from 1, left to right) of the box that is checked or ticked for that row.
        - if the question is optional, sometimes it may not be present in the scanned form.

        Provide only the JSON without any additional text or markers.
  
        JSON form schema:
        #{personal_data_schema + form_schema}
      LLM_PROMPT
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

    def printable_form_fields
      @printable_form_fields ||= IdeaCustomFieldsService.new(@phase.pmethod.custom_form).printable_fields
    end
  end
end
