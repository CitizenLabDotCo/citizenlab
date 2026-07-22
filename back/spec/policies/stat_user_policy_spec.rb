# frozen_string_literal: true

require 'rails_helper'

describe StatUserPolicy do
  subject { described_class.new(user, nil) }

  let(:scope) { described_class::Scope.new(user, User) }

  let!(:space) { create(:space) }
  let!(:project) { create(:single_phase_ideation_project, space: space) }
  let!(:folder) { create(:project_folder, projects: [project], space: space) }
  let!(:test_user) { create(:user) }

  shared_examples 'is denied stats access' do
    it { is_expected.not_to permit(:users_count) }
  end

  shared_examples 'is granted stats access' do
    it { is_expected.to permit(:users_count) }
  end

  shared_examples 'has moderator stats access' do
    include_examples 'is granted stats access'

    it 'includes users from accessible projects in scope' do
      expect(scope.resolve).to include(test_user)
    end
  end

  context 'for a visitor' do
    let(:user) { nil }

    it_behaves_like 'is denied stats access'

    it 'returns no users in scope' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it_behaves_like 'is denied stats access'

    it 'returns no users in scope' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it_behaves_like 'is granted stats access'

    it 'returns all users in scope' do
      expect(scope.resolve).to include(test_user, user)
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
