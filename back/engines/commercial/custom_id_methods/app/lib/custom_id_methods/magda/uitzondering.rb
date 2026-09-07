# frozen_string_literal: true

module CustomIdMethods::Magda
  # One `Uitzondering` element from a MAGDA response (level 2 or 3).
  Uitzondering = Struct.new(:code, :type, :origin, :diagnose, keyword_init: true) do
    def to_s
      [code, type, diagnose].compact.join(' ')
    end

    def self.from_doc(doc)
      doc.xpath('//Uitzondering').map do |node|
        new(
          code: node.at_xpath('Identificatie')&.text&.strip.presence,
          type: node.at_xpath('Type')&.text&.strip.presence,
          origin: node.at_xpath('Oorsprong')&.text&.strip.presence,
          diagnose: node.at_xpath('Diagnose')&.text&.strip.presence
        )
      end
    end
  end
end
