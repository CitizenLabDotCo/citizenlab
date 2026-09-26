# frozen_string_literal: true

require 'rails_helper'

describe OpinionGroups::AnalysisService do
  subject(:result) { described_class.new(phase, options).call }

  let(:options) { {} }
  let(:phase) { create(:common_ground_phase) }

  let!(:gender_field) { create(:custom_field, resource_type: 'User', key: 'gender', code: 'gender', input_type: 'select', title_multiloc: { en: 'Gender' }) }
  let!(:male_option) { create(:custom_field_option, custom_field: gender_field, key: 'male', title_multiloc: { en: 'Male' }) }
  let!(:female_option) { create(:custom_field_option, custom_field: gender_field, key: 'female', title_multiloc: { en: 'Female' }) }

  # Two clearly separated camps: camp 1 likes the first half of the
  # statements and dislikes the second half, camp 2 does the opposite.
  let(:statements) { create_list(:idea, 8, project: phase.project, phases: [phase]) }
  let(:camp1) { create_list(:user, 8, custom_field_values: { gender: 'female' }) }
  let(:camp2) { create_list(:user, 6, custom_field_values: { gender: 'male' }) }

  before do
    # Every user skips one statement, so that no two users vote identically.
    statements.each_with_index do |statement, j|
      camp1.each_with_index do |user, i|
        create(:reaction, reactable: statement, user: user, mode: j < 4 ? 'up' : 'down') unless i % 8 == j
      end
      camp2.each_with_index do |user, i|
        create(:reaction, reactable: statement, user: user, mode: j < 4 ? 'down' : 'up') unless i % 8 == j
      end
    end
  end

  it 'finds the two opinion groups' do
    expect(result.stats[:group_count]).to eq 2
    expect(result.stats[:participants_included]).to eq 14
    expect(result.stats[:statements_included]).to eq 8

    # The camps coincide with gender, so the groups must be homogeneous.
    gender_counts = result.groups.map do |group|
      group[:demographics].find { |d| d[:field_key] == 'gender' }[:categories].to_h { |c| [c[:key], c[:count]] }
    end
    expect(gender_counts).to eq [{ 'male' => 0, 'female' => 8 }, { 'male' => 6, 'female' => 0 }]
  end

  it 'orders groups by size and names them' do
    expect(result.groups.map { |g| g[:size] }).to eq [8, 6]
    expect(result.groups.map { |g| g[:name] }).to eq %w[A B]
  end

  it 'finds representative statements per group' do
    group_a = result.groups.first
    top = group_a[:representative].first
    expect(top[:direction]).to be_in(%w[agree disagree])
    expect(top[:inside_share]).to be > top[:outside_share]
    expect(top[:z]).to be > 2
    expect(group_a[:representative].size).to eq 5
  end

  it 'reports the divisive statements' do
    expect(result.divisive.size).to eq 5
    expect(result.divisive.first[:spread]).to be > 0.5
    expect(result.consensus).to be_empty
  end

  it 'describes the demographic composition of each group' do
    group_a = result.groups.first
    gender = group_a[:demographics].find { |d| d[:field_key] == 'gender' }
    female = gender[:categories].find { |c| c[:key] == 'female' }
    expect(female[:count]).to eq 8
    expect(female[:share]).to eq 1.0
    expect(female[:index]).to be > 1
  end

  it 'suppresses small demographic cells' do
    group_b = result.groups.last
    gender = group_b[:demographics].find { |d| d[:field_key] == 'gender' }
    expect(gender[:categories].find { |c| c[:key] == 'male' }[:count]).to eq 6
    expect(gender[:categories].find { |c| c[:key] == 'female' }[:count]).to eq 0

    result_with_high_threshold = described_class.new(phase, privacy_threshold: 7).call
    male = result_with_high_threshold.groups.last[:demographics].first[:categories].find { |c| c[:key] == 'male' }
    expect(male[:count]).to be_nil
    expect(male[:suppressed]).to be true
  end

  it 'does not expose user ids in the points' do
    expect(result.points.first.keys).to match_array %i[x y group votes demographics]
  end

  it 'reports the participation balance against the registered users' do
    create_list(:user, 6, custom_field_values: { gender: 'male' })
    gender = result.participation_balance.find { |b| b[:field_key] == 'gender' }
    male = gender[:categories].find { |c| c[:key] == 'male' }
    expect(male[:voters_count]).to eq 6
    expect(male[:population_share]).to be > male[:voters_share]
    expect(male[:index]).to be < 1
  end

  context 'with demographics as features' do
    let(:options) { { include_demographics: true, demographic_weight: 1.0 } }

    it 'still finds the two groups and reports demographic loadings' do
      expect(result.stats[:group_count]).to eq 2
      expect(result.axes['x'][:demographics]).not_to be_empty
    end
  end

  context 'with a fixed number of groups' do
    let(:options) { { k: 3 } }

    it 'returns that many groups' do
      expect(result.stats[:group_count]).to eq 3
    end
  end

  context 'when there are no reactions' do
    let(:phase) { create(:common_ground_phase) }

    before { Reaction.delete_all }

    it 'returns an empty result' do
      expect(result.stats[:participants_included]).to eq 0
      expect(result.groups).to be_empty
      expect(result.points).to be_empty
    end
  end

  it 'ignores reactions of authors on their own input' do
    statement = statements.first
    create(:reaction, reactable: statement, user: statement.author, mode: 'up')
    expect(result.stats[:participants_total]).to eq 14
  end
end
