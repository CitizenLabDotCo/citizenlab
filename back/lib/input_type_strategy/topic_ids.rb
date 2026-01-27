# frozen_string_literal: true

module InputTypeStrategy
  class TopicIds < Base
    def supports_select_count?
      true
    end

    def supports_pdf_gpt_import?
      false
    end
  end
end
