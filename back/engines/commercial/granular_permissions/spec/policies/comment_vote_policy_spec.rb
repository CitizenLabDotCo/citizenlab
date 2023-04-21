# frozen_string_literal: true

require 'rails_helper'

describe CommentVotePolicy do
  subject(:policy) { described_class.new(user, vote) }

  let(:scope) { CommentVotePolicy::Scope.new(user, Vote) }
  let(:project) { create(:continuous_project, with_permissions: true) }
  let(:comment) { create(:comment, post: create(:idea, project: project)) }

  context 'for a mortal user who owns the vote on a project where commenting is only allowed by admins' do
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { vote.user }

    before do
      project.permissions
        .find_by(action: 'commenting_idea')
        .update!(permitted_by: 'admins_moderators')
    end

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:down) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
