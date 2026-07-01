# frozen_string_literal: true

require 'rails_helper'

# Guards the de-AT month-name override (config/locales/overrides/de-AT.yml +
# config/initializers/de_at_date_month_names.rb): the rails-i18n gem renders
# January as "Jänner" for de-AT; we render "Januar" instead.
RSpec.describe 'de-AT date month names' do
  it 'renders January as "Januar" (not the gem default "Jänner") for :long' do
    result = I18n.l(Date.new(2026, 1, 15), format: :long, locale: :'de-AT')
    expect(result).to include('Januar')
    expect(result).not_to include('Jänner')
  end

  it 'overrides only January in the wide month_names list' do
    month_names = I18n.t('date.month_names', locale: :'de-AT')
    expect(month_names[1]).to eq('Januar')
    expect(month_names[2]).to eq('Februar')
    expect(month_names[12]).to eq('Dezember')
  end

  it 'leaves the abbreviated month name as the gem default "Jän"' do
    expect(I18n.t('date.abbr_month_names', locale: :'de-AT')[1]).to eq('Jän')
  end
end
