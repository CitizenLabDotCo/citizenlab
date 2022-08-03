# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::Representativeness::CategoricalDistribution do
  subject(:ref_distribution) { build(:categorical_distribution) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  # This patch is needed to test counts validations.
  # See 'reference distribution' shared examples for more info.
  described_class.class_eval do
    def counts=(counts)
      self.distribution = distribution.keys.zip(counts).to_h
    end
  end

  it_behaves_like 'reference distribution', described_class, :categorical_distribution

  it { is_expected.to have_many(:options).through(:custom_field) }

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
