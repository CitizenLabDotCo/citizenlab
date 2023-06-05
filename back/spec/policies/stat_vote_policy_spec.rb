# frozen_string_literal: true

require 'rails_helper'

RSpec.describe StatVotePolicy do
  let(:scope) { described_class::Scope.new(user, Reaction) }

  let_it_be(:upvoted_idea) { create(:idea) }
  let_it_be(:reactions) do
    [
      create_list(:reaction, 2, reactable: upvoted_idea),
      create(:reaction_down),
      create(:comment_reaction)
    ].flatten
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { expect(scope.resolve.count).to eq(votes.count) }
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it { expect(scope.resolve).to be_empty }
  end

  context 'for a visitor' do
    let(:user) { nil }

    it { expect(scope.resolve).to be_empty }
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
