# frozen_string_literal: true

require 'rails_helper'

describe StatCommentPolicy do
  subject { described_class.new(user, nil) }

  let(:scope) { described_class::Scope.new(user, Comment) }

  let!(:space) { create(:space) }
  let!(:project) { create(:single_phase_ideation_project, space: space) }
  let!(:folder) { create(:project_folder, projects: [project], space: space) }
  let!(:idea) { create(:idea, project: project, phases: project.phases) }
  let!(:comment) { create(:comment, idea: idea) }
  let!(:other_comment) { create(:comment) }

  shared_examples 'is denied stats access' do
    it { is_expected.not_to permit(:ideas_count) }
    it { is_expected.not_to permit(:ideas_by_topic) }
    it { is_expected.not_to permit(:ideas_by_project) }
    it { is_expected.not_to permit(:comments_count) }
    it { is_expected.not_to permit(:comments_by_topic) }
    it { is_expected.not_to permit(:comments_by_project) }
    it { is_expected.not_to permit(:comments_by_topic_as_xlsx) }
    it { is_expected.not_to permit(:comments_by_project_as_xlsx) }
  end

  shared_examples 'is granted stats access' do
    it { is_expected.to permit(:ideas_count) }
    it { is_expected.to permit(:ideas_by_topic) }
    it { is_expected.to permit(:ideas_by_project) }
    it { is_expected.to permit(:comments_count) }
    it { is_expected.to permit(:comments_by_topic) }
    it { is_expected.to permit(:comments_by_project) }
    it { is_expected.to permit(:comments_by_topic_as_xlsx) }
    it { is_expected.to permit(:comments_by_project_as_xlsx) }
  end

  shared_examples 'has moderator stats access' do
    include_examples 'is granted stats access'

    it 'includes comments from accessible projects in scope' do
      expect(scope.resolve).to include(comment)
    end
  end

  context 'for a visitor' do
    let(:user) { nil }

    it_behaves_like 'is denied stats access'

    it 'returns no comments in scope' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it_behaves_like 'is denied stats access'

    it 'returns no comments in scope' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it_behaves_like 'is granted stats access'

    it 'returns all comments in scope' do
      expect(scope.resolve).to contain_exactly(comment, other_comment)
    end
  end

  context 'for a project moderator' do
    let(:user) { create(:project_moderator, projects: [project]) }

    it_behaves_like 'has moderator stats access'
  end

  context 'for a folder moderator' do
    let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

    it_behaves_like 'has moderator stats access'
  end

  context 'for a space moderator' do
    let(:user) { create(:space_moderator, spaces: [space]) }

    it_behaves_like 'has moderator stats access'
  end
end
