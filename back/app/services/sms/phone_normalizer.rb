module Sms
  class PhoneNormalizer
    E164_REGEX = /\A\+[1-9]\d{6,14}\z/

    def self.normalize(input)
      return nil if input.blank?

      stripped = input.to_s.gsub(/[\s\-().]/, '')
      stripped = "+#{stripped}" unless stripped.start_with?('+')
      stripped
    end

    def self.valid?(input)
      normalized = normalize(input)
      normalized.present? && E164_REGEX.match?(normalized)
    end
  end
end
