# frozen_string_literal: true

require 'rails_helper'

describe UserCustomFields::Representativeness::RefDistribution do
  subject(:ref_distribution) { build(:ref_distribution) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to belong_to(:custom_field) }
  it { is_expected.to validate_uniqueness_of(:custom_field_id).case_insensitive }
  it { is_expected.to validate_presence_of(:distribution) }

  it 'validates that the distribution has at least 2 options', :aggregate_failures do
    distribution = ref_distribution.distribution

    ref_distribution.distribution = distribution.first(2).to_h
    expect(ref_distribution).to be_valid

    ref_distribution.distribution = distribution.first(1).to_h
    expect(ref_distribution).not_to be_valid
  end

  it 'validates that the distribution options exist', :aggregate_failures do
    ref_distribution.distribution['bad-option-id'] = 1 # count does not matter
    expect(ref_distribution).not_to be_valid
    expect(ref_distribution.errors.messages[:distribution])
      .to include('options must be a subset of the options of the associated custom field.')
  end
end
