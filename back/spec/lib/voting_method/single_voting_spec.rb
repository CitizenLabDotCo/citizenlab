# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VotingMethod::SingleVoting do
  subject(:voting_method) { described_class.new phase }

  let(:phase) { create(:single_voting_phase) }

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:single_voting_phase) }

    it 'sets voting_max_votes_per_idea to 1' do
      phase.voting_max_votes_per_idea = 3
      voting_method.assign_defaults_for_phase
      expect(phase.voting_max_votes_per_idea).to eq 1
    end
  end

  describe '#validate_phase' do
    it 'sets no errors when initialised' do
      voting_method.validate_phase
      expect(phase.errors.details).to be_blank
    end

    it 'sets an error when voting_max_votes_per_idea is not 1' do
      phase.voting_max_votes_per_idea = 2
      voting_method.validate_phase
      expect(phase.errors.details).to eq(
        voting_max_votes_per_idea: [error: :invalid]
      )
    end
  end

  describe '#validate_baskets_idea' do
    it 'sets no errors when the budget is blank' do
      baskets_idea = build(:baskets_idea, idea: build(:idea, budget: nil))
      voting_method.validate_baskets_idea baskets_idea
      expect(baskets_idea.errors.details).to be_blank
    end
  end

  describe '#budget_in_form?' do
    it 'returns false when the user is a moderator of the participation context' do
      expect(voting_method.budget_in_form?(create(:admin))).to be false
    end
  end

  describe '#assign_baskets_idea' do
    it 'does not overwrite the votes' do
      idea = create(:idea, budget: 3, project: phase.project, phases: [phase])
      baskets_idea = create(:baskets_idea, basket: create(:basket, phase: phase), idea: idea, votes: 1)

      voting_method.assign_baskets_idea(baskets_idea.reload)
      baskets_idea.save!

      expect(baskets_idea.votes).to eq 1
    end
  end
end
