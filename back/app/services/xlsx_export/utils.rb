# frozen_string_literal: true

module XlsxExport
  class InvalidSheetnameError < StandardError
    def initialize(sheetname, sanitized_sheetname)
      super("sheet name '#{sheetname}' (sanitized as '#{sanitized_sheetname}') is invalid")
    end
  end

  class Utils
    include HtmlToPlainText

    def escape_formula(text)
      return text unless text.is_a?(String)

      # After https://docs.servicenow.com/bundle/orlando-platform-administration/page/administer/security/reference/escape-excel-formula.html and http://rorsecurity.info/portfolio/excel-injection-via-rails-downloads
      if '=+-@'.include?(text.first) && !text.empty?
        "'#{text}"
      else
        text
      end
    end

    # Sanitize sheet names to comply with Excel naming restrictions.
    # See: https://support.microsoft.com/en-us/office/rename-a-worksheet-3f1f7148-ee83-404d-8ef0-9ff99fbad1f9
    def sanitize_sheetname(sheetname)
      invalid_chars = '?*:[]/\\'
      sanitized_name = sheetname.tr(invalid_chars, '')
      sanitized_name = strip_char(sanitized_name, "'")
      sanitized_name = sanitized_name[0..30]

      if sanitized_name.empty? || sanitized_name == 'History'
        raise InvalidSheetnameError.new(sheetname, sanitized_name)
      end

      sanitized_name
    end

    def convert_to_text_long_lines(html)
      convert_to_text(html).tr("\n", ' ')
    end

    private

    # Return a copy of the string with the leading and trailing +char+ removed.
    # @param [String] string
    # @param [String] char a single character
    def strip_char(string, char)
      string.gsub(/^#{char}+|#{char}+$/, '')
    end
  end
end
