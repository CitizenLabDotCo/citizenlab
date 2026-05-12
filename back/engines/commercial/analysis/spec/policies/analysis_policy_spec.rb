# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::AnalysisPolicy do
  subject { described_class.new(user, analysis) }

  let(:scope) { described_class::Scope.new(user, Analysis::Analysis) }

  shared_examples 'has full analysis access' do
    it { expect(described_class.new(user, Analysis::Analysis)).to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
  end

  shared_examples 'has access to the moderated analysis' do
    include_examples 'has full analysis access'

    it 'scopes to only the moderated analysis' do
      expect(scope.resolve).to contain_exactly(analysis)
    end
  end

  shared_examples 'has only index access' do
    it { expect(described_class.new(user, Analysis::Analysis)).to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }

    it 'has an empty scope' do
      expect(scope.resolve).to be_empty
    end
  end

  shared_examples 'has no access' do
    it { expect(described_class.new(user, Analysis::Analysis)).not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }

    it 'has an empty scope' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'on a project-level analysis' do
    let_it_be(:space) { create(:space) }
    let_it_be(:project) { create(:project_with_active_ideation_phase, space: space) }
    let_it_be(:folder) { create(:project_folder, projects: [project], space: space) }
    let_it_be(:analysis) { create(:analysis, project: project) }
    let_it_be(:other_analysis) { create(:analysis) }

    context 'when user is a visitor' do
      let_it_be(:user) { nil }

      it_behaves_like 'has no access'
    end

    context 'when user is a regular user' do
      let_it_be(:user) { build(:user) }

      it_behaves_like 'has no access'
    end

    context 'when user has admin rights' do
      let_it_be(:user) { build(:admin) }

      include_examples 'has full analysis access'

      it 'scopes to all analyses' do
        expect(scope.resolve).to contain_exactly(analysis, other_analysis)
      end
    end

    context 'when user is a project moderator who can moderate' do
      let_it_be(:user) { build(:project_moderator, projects: [project]) }

      it_behaves_like 'has access to the moderated analysis'
    end

    context 'when user is a project moderator who cannot moderate' do
      let_it_be(:user) { build(:project_moderator) }

      it_behaves_like 'has only index access'
    end

    context 'when user is a folder moderator who can moderate' do
      let_it_be(:user) { build(:project_folder_moderator, project_folders: [folder]) }

      it_behaves_like 'has access to the moderated analysis'
    end

    context 'when user is a folder moderator who cannot moderate' do
      let_it_be(:user) { build(:project_folder_moderator) }

      it_behaves_like 'has only index access'
    end

    context 'when user is a space moderator who can moderate' do
      let_it_be(:user) { build(:space_moderator, spaces: [space]) }

      it_behaves_like 'has access to the moderated analysis'
    end

    context 'when user is a space moderator who cannot moderate' do
      let_it_be(:user) { build(:space_moderator) }

      it_behaves_like 'has only index access'
    end
  end

  context 'on a phase-level analysis' do
    let_it_be(:space) { create(:space) }
    let_it_be(:project) { create(:project_with_active_native_survey_phase, space: space) }
    let_it_be(:folder) { create(:project_folder, projects: [project], space: space) }
    let_it_be(:analysis) { create(:survey_analysis, phase: project.phases.first) }

    context 'when user is a project moderator who can moderate' do
      let_it_be(:user) { build(:project_moderator, projects: [project]) }

      it_behaves_like 'has access to the moderated analysis'
    end

    context 'when user is a folder moderator who can moderate' do
      let_it_be(:user) { build(:project_folder_moderator, project_folders: [folder]) }

      it_behaves_like 'has access to the moderated analysis'
    end

    context 'when user is a space moderator who can moderate' do
      let_it_be(:user) { build(:space_moderator, spaces: [space]) }

      it_behaves_like 'has access to the moderated analysis'
    end
  end
end
