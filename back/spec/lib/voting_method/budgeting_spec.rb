# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VotingMethod::Budgeting do
  subject(:voting_method) { described_class.new project }

  let(:project) { build(:continuous_budgeting_project) }

  describe '#validate_participation_context' do
    it 'sets no errors when voting_max_total and voting_min_total are present' do
      project.voting_max_total = 10
      project.voting_min_total = 0
      voting_method.validate_participation_context
      expect(project.errors.details).to be_blank
    end

    it 'sets errors when voting_max_total and voting_min_total are blank' do
      project.voting_max_total = nil
      project.voting_min_total = nil
      voting_method.validate_participation_context
      expect(project.errors.details).to eq(
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
      baskets_idea =build(:baskets_idea, idea: build(:idea, budget: nil))
      voting_method.validate_baskets_idea baskets_idea
      expect(baskets_idea.errors.details).to eq(idea: [error: :has_no_budget])
    end
  end
end
