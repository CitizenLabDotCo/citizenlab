# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VotingMethod::Budgeting do
  subject(:voting_method) { described_class.new phase }

  let(:phase) { build(:budgeting_phase) }

  describe '#assign_defaults_for_participation_context' do
    let(:phase) { build(:budgeting_phase) }

    it 'changes voting_max_votes_per_idea to nil' do
      phase.voting_max_votes_per_idea = 3
      voting_method.assign_defaults_for_participation_context
      expect(phase.voting_max_votes_per_idea).to be_nil
    end
  end

  describe '#validate_participation_context' do
    it 'sets no errors when voting_max_total and voting_min_total are present' do
      phase.voting_max_total = 10
      phase.voting_min_total = 0
      voting_method.validate_participation_context
      expect(phase.errors.details).to be_blank
    end

    it 'sets errors when voting_max_total and voting_min_total are blank' do
      phase.voting_max_total = nil
      phase.voting_min_total = nil
      voting_method.validate_participation_context
      expect(phase.errors.details).to eq(
        voting_max_total: [error: :blank],
        voting_min_total: [error: :blank]
      )
    end
  end

  describe '#validate_baskets_idea' do
    it 'sets no errors when the budget is present' do
      baskets_idea = build(:baskets_idea, idea: build(:idea, budget: 6))
      voting_method.validate_baskets_idea baskets_idea
      expect(baskets_idea.errors.details).to be_blank
    end

    it 'sets errors when the budget is blank' do
      baskets_idea = build(:baskets_idea, idea: build(:idea, budget: nil))
      voting_method.validate_baskets_idea baskets_idea
      expect(baskets_idea.errors.details).to eq(idea: [error: :has_no_budget])
    end
  end

  describe '#budget_in_form?' do
    it 'returns false when the user is a visitor' do
      expect(voting_method.budget_in_form?(nil)).to be false
    end

    it 'returns false when the user is not a moderator of the participation context' do
      expect(voting_method.budget_in_form?(create(:project_moderator))).to be false
    end

    it 'returns true when the user is a moderator of the participation context' do
      phase.save!
      expect(voting_method.budget_in_form?(create(:project_moderator, projects: [phase.project]))).to be true
    end
  end

  describe '#assign_baskets_idea' do
    it 'overwrites the votes with the budget' do
      project = create(:continuous_budgeting_project)
      idea = create(:idea, budget: 3, project: project, phases: project.phases)
      baskets_idea = create(:baskets_idea, basket: create(:basket, participation_context: project.phases.first), idea: idea, votes: 10)

      voting_method.assign_baskets_idea(baskets_idea.reload)
      baskets_idea.save!

      expect(baskets_idea.votes).to eq 3
    end
  end
end
