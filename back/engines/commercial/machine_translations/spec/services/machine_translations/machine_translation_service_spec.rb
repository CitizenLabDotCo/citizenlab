# frozen_string_literal: true

require 'rails_helper'

describe MachineTranslations::MachineTranslationService do
  subject(:translator) { described_class.new }

  before { stub_easy_translate! }

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
      text = translator.translate '', 'en', 'nl-BE'
      expect(text).to eq ''
    end

    it 'propagates exception from EasyTranslate' do
      expect do
        translator.translate 'Test', 'en', 'un-SUPPORTED-LOCALE'
      end.to raise_error(EasyTranslate::EasyTranslateException)
    end

    it 'retries translating multiple times when specified' do
      expect(EasyTranslate).to receive(:translate).twice
      expect do
        translator.translate 'Test', 'en', 'un-SUPPORTED-LOCALE', retries: 1, max_sleep: 0
      end.to raise_error(EasyTranslate::EasyTranslateException)
    end
  end

  private

  def stub_easy_translate!
    EasyTranslate.stub(:translate) do |_, options|
      translation = {
        'en' => '<strong>Health & Wellness</strong>',
        'fr' => '<strong>Santé &amp; Bien-être</strong>',
        'nl' => ''
      }[options[:to]]
      translation || raise(EasyTranslate::EasyTranslateException, 'Locale not supported!')
    end
  end
end
