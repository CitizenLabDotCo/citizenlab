# frozen_string_literal: true

require 'rails_helper'

describe IdeaCommentPolicy do
  subject { described_class.new(user, comment) }

  let(:scope) { IdeaCommentPolicy::Scope.new(user, idea.comments) }

  context 'on comment on idea in a public project' do
    let(:project) { create(:continuous_project) }
    let(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea) }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end

