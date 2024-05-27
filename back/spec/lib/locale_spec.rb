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
end
