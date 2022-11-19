# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::Representativeness::CategoricalDistribution do
  subject(:ref_distribution) { build(:categorical_distribution) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  # This helper is necessary to run the tests for counts validations in
  # 'reference distribution' shared examples.
  # See 'reference distribution' shared examples for more info.
  def transform_counts(ref_distribution)
    new_counts = yield ref_distribution.distribution.values
    ref_distribution.distribution = ref_distribution.option_ids.zip(new_counts).to_h
  end

  it_behaves_like 'reference distribution', :categorical_distribution

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

  describe '#compute_rscore' do
    subject(:r_score) { ref_distribution.compute_rscore(users) }

    let(:ref_distribution) { create(:categorical_distribution, population_counts: [100, 200]) }
    let(:users) do
      custom_field = ref_distribution.custom_field
      users = custom_field.options.map do |option|
        create(:user, custom_field_values: { custom_field.key => option.key })
      end
      # Users whose custom field value is unknown should not affect the score.
      users << create(:user)
      User.where(id: users)
    end

    it 'creates an RScore with the correct value' do
      expect(r_score.value).to eq(0.5)
    end

    it 'creates an RScore that holds a reference to the reference distribution' do
      expect(r_score.ref_distribution).to eq(ref_distribution)
    end

    it 'creates an RScore that holds a reference to the user counts' do
      expect(r_score.user_counts.size).to eq(3)
      expect(r_score.user_counts.values).to all(eq(1))
    end
  end
end
