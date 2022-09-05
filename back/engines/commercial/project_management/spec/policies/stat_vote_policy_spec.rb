# frozen_string_literal: true

require 'rails_helper'

RSpec.describe StatVotePolicy do
  let(:scope) { described_class::Scope.new(user, Vote) }

  let_it_be(:upvoted_idea) { create(:idea) }
  let_it_be(:votes) do
    [
      create_list(:vote, 2, votable: upvoted_idea),
      create(:downvote),
      create(:comment_vote)
    ].flatten
  end

  context 'for an admin who is also project moderator' do
    let(:user) do
      create(:project_moderator).tap do |user|
        user.roles << { type: 'admin' }
        user.save!
      end
    end

    it { expect(scope.resolve.count).to eq(votes.count) }
  end

  context 'for a project moderator' do
    let(:user) { create(:project_moderator, project_ids: [upvoted_idea.project_id]) }

    it { expect(scope.resolve.count).to eq(2) }
  end
end
