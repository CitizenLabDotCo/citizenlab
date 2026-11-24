# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldAnswer do
  subject(:answer) { build(:custom_field_answer) }

  it { is_expected.to be_valid }

  it 'is invalid with a nil value' do
    answer.value = nil
    expect(answer).to be_invalid
  end

  describe 'built-in values' do
    def answer_for(custom_field, value)
      build(:custom_field_answer, custom_field:, value:)
    end

    it 'accepts male, female or unspecified as gender' do
      gender = create(:custom_field_gender, :with_options)
      expect(answer_for(gender, 'male')).to be_valid
      expect(answer_for(gender, 'female')).to be_valid
      expect(answer_for(gender, 'unspecified')).to be_valid
      expect(answer_for(gender, 'somethingelse')).to be_invalid
    end

    it 'accepts a realistic integer year as birthyear' do
      birthyear = create(:custom_field_birthyear)
      expect(answer_for(birthyear, Time.zone.now.year - 117)).to be_valid
      expect(answer_for(birthyear, Time.zone.now.year - 13)).to be_valid
      expect(answer_for(birthyear, Time.zone.now.year + 1)).to be_invalid
      expect(answer_for(birthyear, 1850)).to be_invalid
      expect(answer_for(birthyear, 1930.4)).to be_invalid
      expect(answer_for(birthyear, 'eighteen hundred')).to be_invalid
    end

    it "accepts an area id or 'outside' as domicile" do
      domicile = create(:custom_field_domicile)
      area = create(:area)
      expect(answer_for(domicile, area.id)).to be_valid
      expect(answer_for(domicile, 'outside')).to be_valid
      expect(answer_for(domicile, 'somethingelse')).to be_invalid
      expect(answer_for(domicile, 5)).to be_invalid
    end
  end

  it 'stores a false value' do
    answer.value = false
    expect(answer.save).to be true
    expect(answer.reload.value).to be false
  end

  it 'accepts empty array values but rejects nil-containing ones' do
    answer.value = []
    expect(answer).to be_valid
    answer.value = [nil]
    expect(answer).not_to be_valid
  end

  it 'is invalid without a custom field' do
    answer.custom_field = nil
    expect(answer).to be_invalid
  end

  it 'rejects a second answer for the same answerable and key at the database level' do
    existing = create(:custom_field_answer)
    duplicate = build(:custom_field_answer, answerable: existing.answerable, custom_field: existing.custom_field)
    expect { duplicate.save! }.to raise_error(ActiveRecord::RecordNotUnique)
  end

  it 'is deleted when its custom field is deleted' do
    field = create(:custom_field)
    answer = create(:custom_field_answer, custom_field: field)
    field.destroy!
    expect(described_class.exists?(answer.id)).to be false
  end

  it 'is deleted when its answerable is deleted' do
    answer = create(:custom_field_answer, answerable: create(:idea))
    answer.answerable.destroy!
    expect(described_class.exists?(answer.id)).to be false
  end
end
