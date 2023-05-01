# frozen_string_literal: true

require 'rails_helper'

describe LocalizationService do
  let(:service) { described_class.new }

  describe 'hour_of_day' do
    it 'returns the correct format for English speaking locales' do
      locales = %w[en en-CA en-GB]

      locales.each do |locale|
        I18n.with_locale(locale) do
          expect(service.hour_of_day(Time.new(-2000, 1, 1, 18, 0, 0))).to eq '6 PM'
        end
      end
    end

    it 'returns the correct format for French speaking locales', skip: 'Implement when translation formats merged' do
      locales = %w[fr-FR fr-BE]

      locales.each do |locale|
        I18n.with_locale(locale) do
          expect(service.hour_of_day(Time.new(-2000, 1, 1, 18, 0, 0))).to eq '18h'
        end
      end
    end

    it 'returns the correct format for non-English, non-French speaking locales', skip: 'Implement when translation formats merged' do
      locales = %w[de-DE nl-BE]

      locales.each do |locale|
        I18n.with_locale(locale) do
          expect(service.hour_of_day(Time.new(-2000, 1, 1, 18, 0, 0))).to eq '18:00'
        end
      end
    end
  end
end
