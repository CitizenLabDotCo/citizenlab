# frozen_string_literal: true

module InputTypeStrategy
  class FileUpload < Base
    def supports_pdf_llm_import?
      false
    end

    def supports_xlsx_import?
      false
    end

    def supports_file_upload?
      true
    end
  end
end
