# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::Representativeness::RScore do
  describe '.compute' do
    subject(:r_score) { described_class.compute(user_counts, ref_distribution) }

    let(:ref_distribution) { create(:categorical_distribution, population_counts: [100, 200]) }
    let(:user_counts) do
      # The number of missing values (UNKNOWN_VALUE_LABEL) does not matter as it does
      # not affect the scores.
      ref_distribution
        .custom_field.option_ids.index_with(100)
        .merge(UserCustomFields::FieldValueCounter::UNKNOWN_VALUE_LABEL => 123)
    end

    it 'creates an RScore with the correct value' do
      expect(r_score.value).to eq(0.5)
    end

    it 'creates an RScore that holds a reference to the reference distribution' do
      expect(r_score.ref_distribution).to eq(ref_distribution)
    end

    it 'creates an RScore that holds a reference to the user counts' do
      expect(r_score.user_counts).to eq(user_counts)
    end
  end

  describe 'scoring methods' do
    shared_examples 'ill-defined scores' do |scoring_method|
      it 'returns NaN when the score is ill-defined' do
        user_counts = { a: 2, b: 5 }
        population_counts = { c: 20, d: 10 }
        score = described_class.send(scoring_method, user_counts, population_counts)
        expect(score).to be_nan
      end
    end

    describe '.min_max_p_ratio' do
      using RSpec::Parameterized::TableSyntax

      where(:user_counts, :population_counts, :expected_value) do
        { a: 1 }             | { a: 4 }         | 1
        { a: 1, b: 4 }       | { a: 10, b: 40 } | 1
        { a: 1, b: 1, c: 2 } | { a: 10, b: 10 } | 1 # c is not taken into account bc it is not in the population_counts
        { a: 1 }             | { a: 10, b: 10 } | 0 # user count for b is considered as 0
        { a: 1, b: 2 }       | { a: 10, b: 10 } | 0.5
        { a: 2, b: 5 }       | { a: 20, b: 10 } | 0.2
        { a: 2, b: 5 }       | { a: 20, b: 10 } | 0.2
      end

      with_them do
        it 'computes the expected value' do
          score = described_class.min_max_p_ratio(user_counts, population_counts)
          expect(score).to eq(expected_value)
        end
      end

      include_examples 'ill-defined scores', :min_max_p_ratio
    end

    describe '.min_mean_p_ratio' do
      using RSpec::Parameterized::TableSyntax

      where(:user_counts, :population_counts, :expected_value) do
        { a: 1 }                | { a: 4 }                   | 1
        { a: 1, b: 4 }          | { a: 10, b: 40 }           | 1
        # c is not taken into account bc it is not in the population_counts
        { a: 1, b: 1, c: 2 }    | { a: 10, b: 10 }           | 1
        # user count for b is considered as 0
        { a: 1 }                | { a: 10, b: 10 }           | 0
        { a: 3, b: 5 }          | { a: 10, b: 10 }           | 0.75
        { a: 1, b: 80, c: 600 } | { a: 10, b: 100, c: 1000 } | 0.2
      end

      with_them do
        it 'computes the expected value' do
          score = described_class.min_mean_p_ratio(user_counts, population_counts)
          expect(score).to be_within(1e-6).of(expected_value)
        end
      end

      include_examples 'ill-defined scores', :min_mean_p_ratio
    end

    describe '.proportional_similarity' do
      using RSpec::Parameterized::TableSyntax

      where(:user_counts, :population_counts, :expected_value) do
        { a: 1 }                | { a: 4 }                   | 1
        { a: 1, b: 4 }          | { a: 10, b: 40 }           | 1
        { a: 2, b: 8 }          | { a: 40, b: 60 }           | 0.8
        # c is not taken into account bc it is not in the population_counts
        { a: 1, b: 1, c: 2 }    | { a: 10, b: 10 }           | 1
        # user count for b is considered as 0
        { a: 1 }                | { a: 10, b: 10 }           | 0.5
      end

      with_them do
        it 'computes the expected value' do
          score = described_class.proportional_similarity(user_counts, population_counts)
          expect(score).to be_within(1e-6).of(expected_value)
        end
      end

      include_examples 'ill-defined scores', :proportional_similarity
    end
  end
end
