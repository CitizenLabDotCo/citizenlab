# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldAnswer do
  subject(:answer) { build(:custom_field_answer) }

  it { is_expected.to be_valid }

  it 'is invalid with a nil value' do
    answer.value = nil
    expect(answer).to be_invalid
  end

  it 'stores a false value' do
    answer.value = false
    expect(answer.save).to be true
    expect(answer.reload.value).to be false
  end

  it 'accepts empty and nil-containing array values' do
    answer.value = []
    expect(answer).to be_valid
    answer.value = [nil]
    expect(answer).to be_valid
  end

  it 'is valid without a custom field' do
    answer.custom_field = nil
    expect(answer).to be_valid
  end

  it 'rejects a second answer for the same answerable and key at the database level' do
    existing = create(:custom_field_answer)
    duplicate = build(:custom_field_answer, answerable: existing.answerable, key: existing.key)
    expect { duplicate.save! }.to raise_error(ActiveRecord::RecordNotUnique)
  end

  it 'is deleted when its custom field is deleted' do
    answer = create(:custom_field_answer)
    answer.custom_field.destroy!
    expect(described_class.exists?(answer.id)).to be false
  end

  it 'is deleted when its answerable is deleted' do
    answer = create(:custom_field_answer, answerable: create(:idea))
    answer.answerable.destroy!
    expect(described_class.exists?(answer.id)).to be false
  end
end
