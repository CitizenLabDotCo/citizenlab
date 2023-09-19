# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::AnalysisPolicy do
  subject { described_class.new(user, analysis) }

  let_it_be(:all_analyses) { create_list(:analysis, 2) }
  let_it_be(:analysis) { all_analyses.first }

  let(:scope) { described_class::Scope.new(user, Analysis::Analysis) }

  context 'when the user has admin rights' do
    let_it_be(:user) { build(:admin) }

    it { expect(described_class.new(user, Analysis::Analysis)).to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
    it { expect(scope.resolve.count).to eq(2) }
  end

  context 'when the user has moderation rights for the associated project' do
    let_it_be(:user) do
      build(:project_moderator, project_ids: [analysis.project_id])
    end

    it { expect(described_class.new(user, Analysis::Analysis)).to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
    it { expect(scope.resolve.count).to eq(1) }
  end

  context 'when the user has moderation rights for the associated phase' do
    let_it_be(:analysis) { create(:survey_analysis) }

    let_it_be(:user) do
      build(:project_moderator, project_ids: [analysis.source_project.id])
    end

    it { expect(described_class.new(user, Analysis::Analysis)).to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
    it { expect(scope.resolve.count).to eq(1) }
  end

  context 'when user has unrelated moderation rights' do
    let_it_be(:user) { build(:project_moderator) }

    it { expect(described_class.new(user, Analysis::Analysis)).to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { expect(scope.resolve.count).to eq(0) }
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    it { expect(described_class.new(user, Analysis::Analysis)).not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { expect(scope.resolve.count).to eq(0) }
  end

  context 'when user is a regular user' do
    let_it_be(:user) { build(:user) }

    it { expect(described_class.new(user, Analysis::Analysis)).not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { expect(scope.resolve.count).to eq(0) }
  end
end
