# frozen_string_literal: true

require 'rails_helper'

describe StatReactionPolicy do
  subject { described_class.new(user, nil) }

  let(:scope) { described_class::Scope.new(user, Reaction) }

  let_it_be(:space, reload: true) { create(:space) }
  let_it_be(:project, reload: true) { create(:single_phase_ideation_project, space: space) }
  let_it_be(:folder, reload: true) { create(:project_folder, projects: [project], space: space) }
  let_it_be(:idea, reload: true) { create(:idea, project: project, phases: project.phases) }
  let_it_be(:idea_reaction, reload: true) { create(:reaction, reactable: idea) }
  let_it_be(:other_idea_reaction, reload: true) { create(:reaction) }
  let_it_be(:comment_reaction, reload: true) { create(:comment_reaction) }

  shared_examples 'is denied stats access' do
    it { is_expected.not_to permit(:reactions_count) }
    it { is_expected.not_to permit(:reactions_by_topic) }
    it { is_expected.not_to permit(:reactions_by_project) }
    it { is_expected.not_to permit(:reactions_by_topic_as_xlsx) }
    it { is_expected.not_to permit(:reactions_by_project_as_xlsx) }
  end

  shared_examples 'is granted stats access' do
    it { is_expected.to permit(:reactions_count) }
    it { is_expected.to permit(:reactions_by_topic) }
    it { is_expected.to permit(:reactions_by_project) }
    it { is_expected.to permit(:reactions_by_topic_as_xlsx) }
    it { is_expected.to permit(:reactions_by_project_as_xlsx) }
  end

  shared_examples 'sees the reaction in the moderated project' do
    include_examples 'is granted stats access'

    it 'includes the reaction on the moderated idea' do
      expect(scope.resolve).to include(idea_reaction)
    end

    it 'excludes reactions outside the moderated projects' do
      expect(scope.resolve).not_to include(other_idea_reaction, comment_reaction)
    end
  end

  shared_examples 'does not see the reaction outside their moderation' do
    include_examples 'is granted stats access'

    it 'excludes the reaction on the unmoderated idea' do
      expect(scope.resolve).not_to include(idea_reaction)
    end
  end

  context 'for a visitor' do
    let(:user) { nil }

    it_behaves_like 'is denied stats access'

    it 'returns no reactions in scope' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it_behaves_like 'is denied stats access'

    it 'returns no reactions in scope' do
      expect(scope.resolve).to be_empty
    end
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it_behaves_like 'is granted stats access'

    it 'returns all reactions in scope' do
      expect(scope.resolve).to contain_exactly(idea_reaction, other_idea_reaction, comment_reaction)
    end
  end

  context 'for an admin who is also a project moderator' do
    let(:user) do
      create(:project_moderator).tap do |user|
        user.roles << { type: 'admin' }
        user.save!
      end
    end

    it_behaves_like 'is granted stats access'

    it 'returns all reactions in scope' do
      expect(scope.resolve).to contain_exactly(idea_reaction, other_idea_reaction, comment_reaction)
    end
  end

  context 'for a project moderator who can moderate' do
    let(:user) { create(:project_moderator, projects: [project]) }

    it_behaves_like 'sees the reaction in the moderated project'
  end

  context 'for a project moderator who cannot moderate' do
    let(:user) { create(:project_moderator) }

    it_behaves_like 'does not see the reaction outside their moderation'
  end

  context 'for a folder moderator who can moderate' do
    let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

    it_behaves_like 'sees the reaction in the moderated project'
  end

  context 'for a folder moderator who cannot moderate' do
    let(:user) { create(:project_folder_moderator) }

    it_behaves_like 'does not see the reaction outside their moderation'
  end

  context 'for a space moderator who can moderate' do
    let(:user) { create(:space_moderator, spaces: [space]) }

    it_behaves_like 'sees the reaction in the moderated project'
  end

  context 'for a space moderator who cannot moderate' do
    let(:user) { create(:space_moderator) }

    it_behaves_like 'does not see the reaction outside their moderation'
  end
end
