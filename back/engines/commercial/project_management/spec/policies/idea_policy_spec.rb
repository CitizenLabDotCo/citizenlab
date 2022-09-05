# frozen_string_literal: true

require 'rails_helper'

describe IdeaPolicy do
  subject(:policy) { described_class.new(user, idea) }

  let(:scope) { IdeaPolicy::Scope.new(user, project.ideas) }

  context 'on idea in a public project' do
    let(:project) { create(:continuous_project) }
    let!(:idea) { create(:idea, project: project) }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on idea in a private admins project' do
    let(:project) { create(:private_admins_project) }
    let!(:idea) { create(:idea, project: project) }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
