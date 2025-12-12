# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class GPTFormParser
    def initialize(phase, locale)
      @phase = phase
      @locale = locale
    end

    # Return in format compatible with idea_to_idea_row
    def parse_idea(file_path, page_count)
      parsed_response = parse(file_path)

      {
        pdf_pages: (1..page_count).to_a,
        fields: parsed_response&.map { |r| { r['text'] => r['answer'] } }&.reduce({}, :merge)
      }
    end

    private

    def parse(file_path)
      pdf_file = Files::File.new(
        name: 'scan.pdf',
        mime_type: 'application/pdf',
        content: File.open(file_path) # Uses the uploader
      )

      message = Analysis::LLM::Message.new(prompt, pdf_file)
      gpt_response = llm.chat(message)

      corrected_response = gpt_response.match(/\[.+\]/m)&.try(:[], 0) # to be sure it is json that can be parsed

      corrected_response.present? ? JSON.parse(corrected_response) : nil
      # binding.pry
    end

    def prompt
      <<~GPT_PROMPT
        In this message is a scanned survey form containing handwritten responses and checked options.
  
        Your task is to extract the text and checked options based on the questions in the JSON form schema below.
  
        Do not attempt to interpret or summarize the responses. Ignore any text that does not appear handwritten. Do not fill in any missing answers.
  
        Do not extract answers unless they are in the correct order in the scanned form.

        The language used in the form is #{@locale}.

        Return the same array of JSON objects in the same order, but with some additional attributes:
        - if the question is a text question, add an attribute answer with the extracted handwritten text as value.
        - if the question has options then return an attribute answer as an array of the checked options' text values. If no options were checked, return an empty array.
        - if the question is optional, sometimes it may not be present in the scanned form.
        - if the question is of type checkbox, return the answer as 'checked' if it has been checked.

        Provide only the JSON without any additional text or markers.
  
        JSON form schema:
        #{personal_data_schema + form_schema}
      GPT_PROMPT
    end

    # Return a simple schema to send to GPT
    def form_schema
      index = 0
      fields = printable_form_fields.map do |f|
        next if f.page?

        # index += 1
        field = {
          id: index += 1,
          type: f.input_type,
          text: f.title_multiloc[@locale.to_s]
        }

        if f.support_options?
          field[:options] = f.options.map.with_index do |o, i|
            { id: i + 1, text: o.title_multiloc[@locale.to_s] }
          end
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
      @llm ||= Analysis::LLM::GPT41.new
    end

    def printable_form_fields
      @printable_form_fields ||= IdeaCustomFieldsService.new(@phase.pmethod.custom_form).printable_fields
    end
  end
end
