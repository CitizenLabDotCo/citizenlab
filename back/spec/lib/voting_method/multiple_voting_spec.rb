# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VotingMethod::MultipleVoting do
  subject(:voting_method) { described_class.new project }

  let(:project) { create(:continuous_multiple_voting_project) }

  describe '#initialize' do
    it 'sets a default voting term of "vote"' do
      expect(project.voting_term_singular_multiloc['en']).to eq 'vote'
      expect(project.voting_term_plural_multiloc['en']).to eq 'votes'
    end
  end

  describe '#validate_participation_context' do
    it 'sets no errors when voting_max_total is present' do
      project.voting_max_total = 10
      voting_method.validate_participation_context
      expect(project.errors.details).to be_blank
    end

    it 'sets an error when voting_max_total is blank' do
      project.voting_max_total = nil
      voting_method.validate_participation_context
      expect(project.errors.details).to eq(
        voting_max_total: [error: :blank]
      )
    end

    it 'sets an error when voting term singular is set and voting term plural is not' do
      project.voting_term_plural_multiloc = nil
      voting_method.validate_participation_context
      expect(project.errors.details).to eq(
        voting_term_plural_multiloc: [error: :blank]
      )
    end

    it 'sets an error when voting term plural is set and voting term singular is not' do
      project.voting_term_singular_multiloc = nil
      voting_method.validate_participation_context
      expect(project.errors.details).to eq(
        voting_term_singular_multiloc: [error: :blank]
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
      idea = create(:idea, budget: 3, project: project)
      baskets_idea = create(:baskets_idea, basket: create(:basket, participation_context: project), idea: idea, votes: 10)

      voting_method.assign_baskets_idea(baskets_idea.reload)
      baskets_idea.save!

      expect(baskets_idea.votes).to eq 10
    end
  end
end
