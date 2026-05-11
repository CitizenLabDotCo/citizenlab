# frozen_string_literal: true

require 'rails_helper'

describe Polls::QuestionPolicy do
  subject { described_class.new(user, question) }

  let(:scope) { described_class::Scope.new(user, Polls::Question) }

  let!(:space) { create(:space) }
  let!(:project) { create(:single_phase_poll_project, space: space) }
  let!(:folder) { create(:project_folder, projects: [project], space: space) }
  let!(:question) { create(:poll_question, phase: project.phases.first) }

  shared_examples 'can moderate the question' do
    it { is_expected.to permit(:show)    }
    it { is_expected.to permit(:create)  }
    it { is_expected.to permit(:update)  }
    it { is_expected.to permit(:reorder) }
    it { is_expected.to permit(:destroy) }

    it 'indexes the question' do
      expect(scope.resolve).to include(question)
    end
  end

  shared_examples 'cannot moderate the question' do
    it { is_expected.to     permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:reorder) }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the question' do
      expect(scope.resolve).to include(question)
    end
  end

  context 'for a visitor' do
    let(:user) { nil }

    it_behaves_like 'cannot moderate the question'
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it_behaves_like 'cannot moderate the question'
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it_behaves_like 'can moderate the question'
  end

  context 'for a project moderator who can moderate' do
    let(:user) { create(:project_moderator, projects: [project]) }

    it_behaves_like 'can moderate the question'
  end

  context 'for a project moderator who cannot moderate' do
    let(:user) { create(:project_moderator) }

    it_behaves_like 'cannot moderate the question'
  end

  context 'for a folder moderator who can moderate' do
    let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

    it_behaves_like 'can moderate the question'
  end

  context 'for a folder moderator who cannot moderate' do
    let(:user) { create(:project_folder_moderator) }

    it_behaves_like 'cannot moderate the question'
  end

  context 'for a space moderator who can moderate' do
    let(:user) { create(:space_moderator, spaces: [space]) }

    it_behaves_like 'can moderate the question'
  end

  context 'for a space moderator who cannot moderate' do
    let(:user) { create(:space_moderator) }

    it_behaves_like 'cannot moderate the question'
  end
end
