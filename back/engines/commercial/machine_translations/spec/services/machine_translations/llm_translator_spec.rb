# frozen_string_literal: true

require 'rails_helper'

describe MachineTranslations::LLMTranslator do
  subject(:translator) { described_class.new(llm: llm) }

  let(:llm) { instance_double(Analysis::LLM::GPT4oMini) }

  describe '#translate' do
    it 'sends the text and the locales to the LLM and returns the plain text translation' do
      allow(llm).to receive(:chat).and_return("<content>\nFietspaden in het centrum\n</content>")

      expect(translator.translate('Bike lanes in the centre', 'en', 'nl-BE')).to eq 'Fietspaden in het centrum'
      expect(llm).to have_received(:chat).with(
        a_string_including('Bike lanes in the centre', '(en)', '(nl-BE)', 'plain text')
      )
    end

    it 'keeps the allowed HTML and removes unsafe HTML' do
      allow(llm).to receive(:chat).and_return('<p>Zie <a href="https://example.com">hier</a></p><script>alert(1)</script>')

      translation = translator.translate('<p>See <a href="https://example.com">here</a></p>', 'en', 'nl-BE')
      expect(translation).to start_with '<p>Zie <a href="https://example.com"'
      expect(translation).not_to include '<script>'
      expect(llm).to have_received(:chat).with(a_string_including('The content is HTML'))
    end

    it 'does not call the LLM for blank text or for the same language' do
      allow(llm).to receive(:chat)

      expect(translator.translate('', 'en', 'nl-BE')).to eq ''
      expect(translator.translate('Fietspad', 'nl-BE', 'nl-NL')).to eq 'Fietspad'
      expect(llm).not_to have_received(:chat)
    end
  end

  describe '#translate_to_locales' do
    it 'returns a translation per target locale' do
      allow(llm).to receive(:chat).and_return('Vertaling')

      expect(translator.translate_to_locales('Text', 'en', %w[nl-BE fr-FR])).to eq('nl-BE' => 'Vertaling', 'fr-FR' => 'Vertaling')
    end
  end
end
