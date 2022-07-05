# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::Representativeness::RefDistribution do
  subject(:ref_distribution) { build(:ref_distribution) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to belong_to(:custom_field) }
  it { is_expected.to have_many(:options).through(:custom_field) }
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

  it 'validates that the distribution counts are positive', :aggregate_failures do
    distribution = ref_distribution.distribution
    distribution[distribution.keys.first] = -1

    expect(ref_distribution).not_to be_valid
    expect(ref_distribution.errors.messages[:distribution])
      .to include('population counts must be strictly positive.')
  end

  it 'validates that the distribution counts are integers', :aggregate_failures do
    distribution = ref_distribution.distribution
    distribution[distribution.keys.first] = 1.5

    expect(ref_distribution).not_to be_valid
    expect(ref_distribution.errors.messages[:distribution])
      .to include('population counts must be integers.')
  end

  it 'validates that the distribution counts are not nil', :aggregate_failures do
    distribution = ref_distribution.distribution
    distribution[distribution.keys.first] = nil

    expect(ref_distribution).not_to be_valid
    expect(ref_distribution.errors.messages[:distribution])
      .to include('population counts cannot be nil.')
  end

  describe '#probabilities_and_counts' do
    subject(:probabilities_and_counts) { ref_distribution.probabilities_and_counts }

    let(:probabilities) { probabilities_and_counts.values.pluck(:probability) }
    let(:counts) { probabilities_and_counts.values.pluck(:count) }

    it 'includes original counts' do
      expect(counts).to eq(ref_distribution.distribution.values)
    end

    it 'returns correct probabilities', :aggregate_failures do
      total_population = ref_distribution.distribution.values.sum
      expected_probabilities = counts.map { |count| count.to_f / total_population }
      differences = probabilities.zip(expected_probabilities).map { |prob1, prob2| (prob1 - prob2).abs }

      expect(differences).to all(be <= 1e-6)
      expect(probabilities.sum).to be_within(1e-6).of(1)
    end
  end
end
