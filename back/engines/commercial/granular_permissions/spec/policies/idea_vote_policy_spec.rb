# frozen_string_literal: true

require 'rails_helper'

describe IdeaVotePolicy do
  subject(:policy) { described_class.new(user, vote) }

  let(:scope) { IdeaVotePolicy::Scope.new(user, Vote) }
  let(:project) { create(:continuous_project) }
  let(:votable) { create(:idea, project: project) }
  let!(:vote) { create(:vote, votable: votable) }

  context 'for a mortal user who owns the vote on an idea in a project where voting is not permitted' do
    let!(:user) { create(:user) }
    let!(:idea) { create(:idea, project: project) }
    let!(:vote) { create(:vote, votable: idea, user: user) }
    let!(:project) do
      p = create(:continuous_project).tap do |project|
        project.permissions.find_by(action: 'voting_idea')
               .update!(permitted_by: 'admins_moderators')
      end
    end

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
