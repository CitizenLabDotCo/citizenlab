# frozen_string_literal: true

class TextUtils
  class << self
    def normalize(str)
      result = str.to_s.downcase.strip
      result = I18n.transliterate(result) if latinish?(str)
      result
    end

    def latinish?(str)
      # When it contains a character A-Z or a-z.
      str =~ /\A.*[A-Za-z]+.*\z/
    end
  end
end
