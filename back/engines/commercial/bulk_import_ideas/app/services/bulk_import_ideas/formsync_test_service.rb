# frozen_string_literal: true

module BulkImportIdeas
  class FormsyncTestService
    MODELS = {
      'gpt_5' => Analysis::LLM::GPT5,
      'gpt_41' => Analysis::LLM::GPT41,
      'gpt_4o' => Analysis::LLM::GPT4o,
      'gpt_4o_mini' => Analysis::LLM::GPT4oMini,
      'claude_opus_45' => Analysis::LLM::ClaudeOpus45,
      'claude_sonnet_45' => Analysis::LLM::ClaudeSonnet45,
      'claude_haiku_45' => Analysis::LLM::ClaudeHaiku45,
      'gemini_3_flash' => Analysis::LLM::Gemini3Flash,
      'gemini_3_pro' => Analysis::LLM::Gemini3Pro
    }.freeze

    def initialize(model_key:, pdf_base64:, locale:)
      @locale = locale
      @model_key = model_key
      @pdf_base64 = pdf_base64
    end

    def call
      model = llm

      pdf_file = Files::File.new(
        name: 'scan.pdf',
        mime_type: 'application/pdf'
      )
      pdf_file.content_by_content = {
        name: 'scan.pdf',
        content: @pdf_base64
      }

      message = Analysis::LLM::Message.new(prompt, pdf_file)
      model.chat(message)
    end

    def self.model_options
      MODELS.keys
    end

    private

    def prompt
      <<~PROMPT
        In this message is a scanned survey form that has been filled in by hand.

        Your task is to extract ALL questions and their answers from the form.

        Do not attempt to interpret or summarize the responses. Ignore any text that does not appear handwritten. Do not fill in any missing answers.

        You MUST include ALL questions from the form, even if they have no answer. For unanswered questions, set the "answer" to null. Never skip a question just because it is blank.

        Include the full question text exactly as it appears on the form, including any annotations like "(optional)".

        The language used in the form is #{@locale}.

        For each question found in the form, return a JSON object with the following attributes:
        - "id": the question number as printed on the form (e.g. "1", "2", "3"). If a question is a follow-up or sub-question without its own number (e.g. "If Other, please specify"), use the parent question's number with a letter suffix (e.g. "6a", "6b"). If no number is printed, use the position as a string.
        - "type": the type of question. Use one of: "text", "multiline_text", "select", "multiselect", "checkbox", "linear_scale", "rating", "sentiment_linear_scale", "ranking", "matrix_linear_scale"
        - "text": the main question title only. Do not include any subtitle, description, helper text, or instructions that appear below the title (e.g. "select all that apply", "Choose as many as you like"). Include annotations that are part of the title itself like "(optional)".
        - "options": (only for select, multiselect, ranking) array of option texts
        - "matrix_statements": (only for matrix_linear_scale) array of statement texts
        - "labels": (only for matrix_linear_scale) array of scale labels from left to right
        - "answer": the extracted answer, formatted as follows:
          - text/multiline_text: the handwritten text as a string
          - select: a single selected option text as a string
          - multiselect: array of checked/ticked option texts
          - checkbox: "checked" if checked, null if not
          - linear_scale/rating/sentiment_linear_scale: a number
          - ranking: array of option texts ordered by rank (lowest to highest)
          - matrix_linear_scale: object with statement text as key and column number (starting from 1, left to right) as value

        Return the result as a JSON array. Provide only the JSON without any additional text or markers.
      PROMPT
    end

    def llm
      model_class = MODELS[@model_key]
      raise ArgumentError, "Unknown model: #{@model_key}" unless model_class

      model_class.new
    end
  end
end
