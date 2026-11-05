# frozen_string_literal: true

require 'rails_helper'

describe MachineTranslations::MachineTranslationService do
  subject(:translator) { described_class.new }

  let(:llm_translator) { instance_double(MachineTranslations::LLMTranslator) }

  before do
    allow(MachineTranslations::LLMTranslator).to receive(:new).and_return(llm_translator)
    allow(llm_translator).to receive(:translate) do |_text, _locale_from, locale_to|
      translation = {
        'en' => '<strong>Health & Wellness</strong>',
        'fr-BE' => '<strong>Santé &amp; Bien-être</strong>',
        'nl-NL' => ''
      }[locale_to]
      translation || raise(ArgumentError, 'Locale not supported!')
    end
  end

  describe 'translate' do
    it 'translates to the correct language for a given locale' do
      text = translator.translate 'Test', 'en', 'fr-BE'
      expect(text).to eq '<strong>Santé &amp; Bien-être</strong>'
    end

    it 'corrects translated HTML' do
      text = translator.translate '<strong>Gezondheid &amp; Welzijn</strong>', 'nl-BE', 'en'
      doc = Nokogiri::HTML.fragment text
      expect(doc.errors).to be_blank
      expect(text).to eq '<strong>Health &amp; Wellness</strong>'
    end

    it 'propagates empty translations' do
      text = translator.translate '', 'en', 'nl-NL'
      expect(text).to eq ''
    end

    it 'propagates exception from the translator' do
      expect do
        translator.translate 'Test', 'en', 'de-DE'
      end.to raise_error(ArgumentError)
    end

    it 'retries translating multiple times when specified' do
      expect do
        translator.translate 'Test', 'en', 'de-DE', retries: 1, max_sleep: 0
      end.to raise_error(ArgumentError)
      expect(llm_translator).to have_received(:translate).twice
    end
  end
end
