require 'rails_helper'

RSpec.describe Locale do
  describe 'initialize' do
    it 'returns a locale object when the locale is supported' do
      locale = described_class.new('fr-FR')
      expect(locale).to be_present
      expect(locale.locale_sym).to eq(:'fr-FR')
    end

    it 'raises an error when the locale is not supported' do
      expect { described_class.new('zz-XX') }.to raise_error(ClErrors::AssertionError, 'Locale zz-XX is not supported')
    end
  end

  describe 'default' do
    it 'returns the first tenant locale when the tenant uses multiple languages' do
      expect(described_class.default.locale_sym).to eq :en
    end

    it 'returns a corresponding locale when the tenant uses a single language' do
      config = build(:app_configuration, settings: { core: { locales: ['nl-NL'] } })
      locale = described_class.default(config: config)
      expect(locale).to be_present
      expect(locale.locale_sym).to eq(:'nl-NL')
    end
  end

  describe 'text_direction' do
    it 'returns ltr when the locale is not RTL' do
      locale = described_class.new('fr-FR')
      expect(locale.text_direction).to eq('ltr')
    end

    it 'returns rtl when the locale is RTL' do
      locale = described_class.new('ar-SA')
      expect(locale.text_direction).to eq('rtl')
    end
  end

  describe 'monolingual' do
    it 'returns nil when the tenant uses multiple languages' do
      expect(described_class.monolingual).to be_nil
    end

    it 'returns a corresponding locale when the tenant uses a single language' do
      config = build(:app_configuration, settings: { core: { locales: ['nl-NL'] } })
      locale = described_class.monolingual(config: config)
      expect(locale).to be_present
      expect(locale.locale_sym).to eq(:'nl-NL')
    end
  end

  describe 'fallback_languages' do
    it 'returns the fallback languages of the locale' do
      CL2_SUPPORTED_LOCALES.each do |locale_sym|
        locale = described_class.new locale_sym
        languages = locale.fallback_languages
        expect(languages.first).to eq locale.language
        expect(languages.last).to eq I18n.default_locale
        expect(languages).to eq languages.uniq
        expect(languages).to include :es if locale_sym == :'ca-ES'
      end
    end
  end

  describe 'language_copy' do
    it 'returns the language copy of the locale' do
      locale = described_class.new('fr-FR')
      expect(locale.language_copy).to eq('French')
      I18n.with_locale(:'nl-NL') do
        expect(locale.language_copy).to eq('Frans')
      end
    end
  end
end
