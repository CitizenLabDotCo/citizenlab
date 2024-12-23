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

  describe 'resolve_multiloc' do
    it 'returns the translation for the current locale when present' do
      locale = described_class.new('fr-FR')
      multiloc = { 'en' => 'English', 'fr-BE' => 'French (BE)', 'fr-FR' => 'French (FR)' }
      expect(locale.resolve_multiloc(multiloc)).to eq('French (FR)')
    end

    it 'returns the translation for a locale of the same language when the current locale is not present' do
      locale = described_class.new('fr-FR')
      multiloc = { 'en' => 'English', 'fr-BE' => 'French', 'nl-BE' => 'Dutch' }
      expect(locale.resolve_multiloc(multiloc)).to eq('French')
    end

    it 'returns the translation for the default locale when the current locale is not present' do
      locale = described_class.new('fr-FR')
      multiloc = { 'de-DE' => 'German', 'en' => 'English', 'nl-BE' => 'Dutch' }
      expect(locale.resolve_multiloc(multiloc)).to eq('English')
    end

    it 'returns the translation for the first locale otherwise' do
      locale = described_class.new('fr-FR')
      multiloc = { 'de-DE' => 'German', 'nl-BE' => 'Dutch' }
      expect(locale.resolve_multiloc(multiloc)).to eq('German')
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

  describe 'i18n fallback config' do
    it 'falls back to sr-Cyrl when sr-SP is not available' do
      translation = I18n.with_locale('sr-SP') { I18n.t('symbols.outside', raise: true) }
      expect(translation).to eq "Someting Cyrillic you wouldn't understand"
    end
  end
end
