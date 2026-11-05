# frozen_string_literal: true

require 'rails_helper'

# Guards the de-AT month-name override (config/locales/overrides/de-AT.yml +
# config/initializers/de_at_date_month_names.rb): the rails-i18n gem renders
# January as "Jänner"/"Jän" for de-AT; we render "Januar"/"Jan" instead.
RSpec.describe I18n do
  context 'with de-AT date month names' do
    it 'renders January as "Januar" (not the gem default "Jänner") for :long' do
      result = described_class.l(Date.new(2026, 1, 15), format: :long, locale: :'de-AT')
      expect(result).to include('Januar')
      expect(result).not_to include('Jänner')
    end

    it 'renders January as "Jan" (not the gem default "Jän") for a :short time' do
      # de-AT time.formats.short uses %b (abbreviated month); this is the path
      # the event-registration mailer takes.
      result = described_class.l(Time.utc(2026, 1, 15, 9, 30), format: :short, locale: :'de-AT')
      expect(result).to include('Jan')
      expect(result).not_to include('Jän')
    end

    it 'overrides only January in the wide month_names list' do
      month_names = described_class.t('date.month_names', locale: :'de-AT')
      expect(month_names[1]).to eq('Januar')
      expect(month_names[2]).to eq('Februar')
      expect(month_names[12]).to eq('Dezember')
    end

    it 'overrides only January in the abbreviated abbr_month_names list' do
      abbr = described_class.t('date.abbr_month_names', locale: :'de-AT')
      expect(abbr[1]).to eq('Jan')
      expect(abbr[2]).to eq('Feb')
      expect(abbr[12]).to eq('Dez')
    end
  end
end
