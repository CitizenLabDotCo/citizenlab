# frozen_string_literal: true

require 'rails_helper'

describe Volunteering::CausePolicy do
  subject { described_class.new(user, cause) }

  let(:scope) { described_class::Scope.new(user, Volunteering::Cause) }

  let_it_be(:space, reload: true) { create(:space) }
  let_it_be(:project, reload: true) { create(:single_phase_volunteering_project, space: space) }
  let_it_be(:folder, reload: true) { create(:project_folder, projects: [project], space: space) }
  let_it_be(:cause, reload: true) { create(:cause, phase: project.phases.first) }

  shared_examples 'can moderate the cause' do
    it { is_expected.to permit(:show)    }
    it { is_expected.to permit(:create)  }
    it { is_expected.to permit(:update)  }
    it { is_expected.to permit(:reorder) }
    it { is_expected.to permit(:destroy) }

    it 'indexes the cause' do
      expect(scope.resolve).to include(cause)
    end
  end

  shared_examples 'cannot moderate the cause' do
    it { is_expected.to     permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:reorder) }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the cause' do
      expect(scope.resolve).to include(cause)
    end
  end

  context 'for a visitor' do
    let(:user) { nil }

    it_behaves_like 'cannot moderate the cause'
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it_behaves_like 'cannot moderate the cause'
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it_behaves_like 'can moderate the cause'
  end

  context 'for a project moderator who can moderate' do
    let(:user) { create(:project_moderator, projects: [project]) }

    it_behaves_like 'can moderate the cause'
  end

  context 'for a project moderator who cannot moderate' do
    let(:user) { create(:project_moderator) }

    it_behaves_like 'cannot moderate the cause'
  end

  context 'for a folder moderator who can moderate' do
    let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

    it_behaves_like 'can moderate the cause'
  end

  context 'for a folder moderator who cannot moderate' do
    let(:user) { create(:project_folder_moderator) }

    it_behaves_like 'cannot moderate the cause'
  end

  context 'for a space moderator who can moderate' do
    let(:user) { create(:space_moderator, spaces: [space]) }

    it_behaves_like 'can moderate the cause'
  end

  context 'for a space moderator who cannot moderate' do
    let(:user) { create(:space_moderator) }

    it_behaves_like 'cannot moderate the cause'
  end
end
