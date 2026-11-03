# frozen_string_literal: true

require 'rails_helper'

describe CustomIdMethods::Magda::ResidencyCheck do
  let(:today) { Date.new(2026, 8, 24) }

  def found(postal_code: '2880', birth_date: '1990-05-15')
    CustomIdMethods::Magda::GeefPersoonResult.new(status: :found, postal_code: postal_code, birth_date_string: birth_date)
  end

  def check(result, postal_codes: ['2880'], minimum_age: 12)
    described_class.call(result, postal_codes: postal_codes, minimum_age: minimum_age, today: today)
  end

  it 'is valid for an eligible postcode and an old enough person' do
    expect(check(found)).to eq 'valid'
  end

  it 'is lives_outside for another postcode' do
    expect(check(found(postal_code: '9000'))).to eq 'lives_outside'
  end

  it 'is lives_outside when MAGDA returns no postcode' do
    expect(check(found(postal_code: nil))).to eq 'lives_outside'
  end

  it 'normalises postcodes on both sides' do
    expect(check(found(postal_code: ' 2880 '), postal_codes: [2880, ' 2890'])).to eq 'valid'
  end

  it 'does not restrict on postcode when the list is empty' do
    expect(check(found(postal_code: '9000'), postal_codes: [])).to eq 'valid'
    expect(check(found(postal_code: '9000'), postal_codes: nil)).to eq 'valid'
  end

  describe 'minimum age' do
    it 'is valid on the birthday itself' do
      expect(check(found(birth_date: '2014-08-24'))).to eq 'valid'
    end

    it 'is under_minimum_age one day before the birthday' do
      expect(check(found(birth_date: '2014-08-25'))).to eq 'under_minimum_age'
    end

    it 'handles a 29 February birthday' do
      expect(described_class.call(found(birth_date: '2012-02-29'), postal_codes: ['2880'], minimum_age: 12, today: Date.new(2024, 2, 28))).to eq 'under_minimum_age'
      expect(described_class.call(found(birth_date: '2012-02-29'), postal_codes: ['2880'], minimum_age: 12, today: Date.new(2024, 2, 29))).to eq 'valid'
    end

    it 'uses the latest possible date for an incomplete birth date' do
      expect(check(found(birth_date: '2014-00-00'))).to eq 'under_minimum_age'
      expect(check(found(birth_date: '2013-00-00'))).to eq 'valid'
    end

    it 'is service_error when the birth date is missing but an age is required' do
      expect(check(found(birth_date: nil))).to eq 'service_error'
    end

    it 'ignores the birth date when no minimum age is configured' do
      expect(check(found(birth_date: nil), minimum_age: nil)).to eq 'valid'
      expect(check(found(birth_date: '2020-01-01'), minimum_age: '')).to eq 'valid'
    end

    it 'accepts the minimum age as a string' do
      expect(check(found(birth_date: '2020-01-01'), minimum_age: '12')).to eq 'under_minimum_age'
    end
  end

  it 'is no_match when MAGDA knows no person' do
    result = CustomIdMethods::Magda::GeefPersoonResult.new(status: :not_found)
    expect(check(result)).to eq 'no_match'
  end

  it 'is service_error when the lookup failed' do
    result = CustomIdMethods::Magda::GeefPersoonResult.service_error(StandardError.new('boom'))
    expect(check(result)).to eq 'service_error'
  end
end
