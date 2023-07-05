# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VotingMethod::SingleVoting do
  subject(:voting_method) { described_class.new project }

  let(:project) { create(:continuous_single_voting_project) }

  describe '#initialize' do
    it 'has max_votes_per_idea to 1' do
      expect(project.voting_max_votes_per_idea).to eq 1
    end
  end

  describe '#validate_participation_context' do
    it 'sets no errors when initialised' do
      voting_method.validate_participation_context
      expect(project.errors.details).to be_blank
    end

    it 'sets an error when voting_max_votes_per_idea is not 1' do
      project.voting_max_votes_per_idea = 2
      voting_method.validate_participation_context
      expect(project.errors.details).to eq(
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

  describe '#assign_basket' do
    it 'does not overwrite the votes' do
      basket = create(:basket, participation_context: project)
      [1, 2, 3].map do |budget|
        create(:baskets_idea, basket: basket, idea: create(:idea, budget: budget, project: project))
      end
      voting_method.assign_basket(basket.reload)
      basket.save!
      expect(basket.baskets_ideas.map(&:votes)).to contain_exactly 1, 1, 1
    end
  end
end
