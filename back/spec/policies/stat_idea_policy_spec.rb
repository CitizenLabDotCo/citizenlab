# frozen_string_literal: true

require 'rails_helper'

describe StatIdeaPolicy do
  subject { described_class.new(user, nil) }

  let(:scope) { described_class::Scope.new(user, Idea) }

  let!(:space) { create(:space) }
  let!(:project) { create(:single_phase_ideation_project, space: space) }
  let!(:folder) { create(:project_folder, projects: [project], space: space) }
  let!(:idea) { create(:idea, project: project, phases: project.phases) }
  let!(:other_idea) { create(:idea) }

  shared_examples 'is denied stats access' do
    it { is_expected.not_to permit(:ideas_by_topic) }
    it { is_expected.not_to permit(:ideas_by_project) }
    it { is_expected.not_to permit(:ideas_by_topic_as_xlsx) }
    it { is_expected.not_to permit(:ideas_by_project_as_xlsx) }
  end

  shared_examples 'is granted stats access' do
    it { is_expected.to permit(:ideas_by_topic) }
    it { is_expected.to permit(:ideas_by_project) }
    it { is_expected.to permit(:ideas_by_topic_as_xlsx) }
    it { is_expected.to permit(:ideas_by_project_as_xlsx) }
  end

  shared_examples 'sees the idea in the moderated project' do
    include_examples 'is granted stats access'

    it 'includes the idea from the moderated project' do
      expect(scope.resolve).to include(idea)
    end
  end

  shared_examples 'does not see the idea outside their moderation' do
    include_examples 'is granted stats access'

    it 'excludes the idea from the unmoderated project' do
      expect(scope.resolve).not_to include(idea)
    end
  end

  context 'for a visitor' do
    let(:user) { nil }

    it_behaves_like 'is denied stats access'

    it 'returns no ideas in scope' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it_behaves_like 'is denied stats access'

    it 'returns no ideas in scope' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it_behaves_like 'is granted stats access'

    it 'returns all ideas in scope' do
      expect(scope.resolve).to contain_exactly(idea, other_idea)
    end
  end

  context 'for a project moderator who can moderate' do
    let(:user) { create(:project_moderator, projects: [project]) }

    it_behaves_like 'sees the idea in the moderated project'
  end

  context 'for a project moderator who cannot moderate' do
    let(:user) { create(:project_moderator) }

    it_behaves_like 'does not see the idea outside their moderation'
  end

  context 'for a folder moderator who can moderate' do
    let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

    it_behaves_like 'sees the idea in the moderated project'
  end

  context 'for a folder moderator who cannot moderate' do
    let(:user) { create(:project_folder_moderator) }

    it_behaves_like 'does not see the idea outside their moderation'
  end

  context 'for a space moderator who can moderate' do
    let(:user) { create(:space_moderator, spaces: [space]) }

    it_behaves_like 'sees the idea in the moderated project'
  end

  context 'for a space moderator who cannot moderate' do
    let(:user) { create(:space_moderator) }

    it_behaves_like 'does not see the idea outside their moderation'
  end
end
