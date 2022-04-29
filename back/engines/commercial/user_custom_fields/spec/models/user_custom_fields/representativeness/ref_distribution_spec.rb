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
  it { is_expected.to validate_length_of(:distribution).is_at_least(2).with_message('must have at least 2 options.') }

  it 'validates that the distribution options exist', :aggregate_failures do
    ref_distribution.distribution['bad-option-id'] = 1 # count does not matter
    expect(ref_distribution).not_to be_valid
    expect(ref_distribution.errors.messages[:distribution])
      .to include('options must be a subset of the options of the associated custom field.')
  end
end
