# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::Representativeness::BinnedDistribution do
  subject(:binned_distribution) { build(:binned_distribution) }

  let(:bin_boundaries) { binned_distribution.distribution['bins'] }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  # This helper is necessary to run the tests for counts validations in
  # 'reference distribution' shared examples.
  # See 'reference distribution' shared examples for more info.
  def transform_counts(ref_distribution)
    counts = ref_distribution.distribution['counts']
    new_counts = yield counts.dup
    ref_distribution.distribution['counts'] = new_counts
  end

  it_behaves_like 'reference distribution', :binned_distribution

  it 'validates that bin boundaries are ordered', :aggregate_failures do
    bin_boundaries.reverse!

    expect(binned_distribution).not_to be_valid
    expect(binned_distribution.errors[:distribution])
      .to include('bins are not properly defined. The bin boundaries must be sorted.')
  end

  it 'validates that inner bin boundaries are not nil', :aggregate_failures do
    bin_boundaries[1] = nil

    expect(binned_distribution).not_to be_valid
    expect(binned_distribution.errors[:distribution])
      .to include('bins are not properly defined. Only the first and last bins can be open-ended.')
  end

  it 'validates the number of bins matches the number of counts', :aggregate_failures do
    bin_boundaries.pop

    expect(binned_distribution).not_to be_valid
    expect(binned_distribution.errors[:distribution])
      .to include('bins are not properly defined. The number of bins must match the number of counts.')
  end

  it 'validates that bin boundaries are distinct', :aggregate_failures do
    bin_boundaries[0] = bin_boundaries[1]

    expect(binned_distribution).not_to be_valid
    expect(binned_distribution.errors[:distribution])
      .to include('bins are not properly defined. The bin boundaries must be distinct.')
  end

  it "validates that the custom field is 'birthyear'", :aggregate_failures do
    binned_distribution.custom_field = build(:custom_field_select)

    expect(binned_distribution).not_to be_valid
    expect(binned_distribution.errors[:custom_field]).to include(
      "input type must be 'number' for binned distributions.",
      "key must be 'birthyear' for binned distributions."
    )
  end

  describe '#bin_boundaries' do
    subject { binned_distribution.bin_boundaries }

    it { is_expected.to be_frozen }
  end

  describe '#counts' do
    subject { binned_distribution.counts }

    it { is_expected.to be_frozen }
  end

  describe '#compute_rscore' do
    subject(:r_score) { ref_distribution.compute_rscore(users) }

    let!(:ref_distribution) do
      create(:binned_distribution, bins: [nil, 40, nil], counts: [10, 20])
    end

    let(:users) do
      birthyears = [2000, 1950]
      users = birthyears.map { |year| create(:user, birthyear: year) }
      # Users without year of birth should not affect the score.
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
      expect(r_score.user_counts).to eq [1, 1]
    end
  end
end
