# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VotingMethod::MultipleVoting do
  subject(:voting_method) { described_class.new phase }

  let(:phase) { create(:multiple_voting_phase) }

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:multiple_voting_phase) }

    it 'does not change voting_max_votes_per_idea' do
      phase.voting_max_votes_per_idea = 3
      voting_method.assign_defaults_for_phase
      expect(phase.voting_max_votes_per_idea).to eq 3
    end
  end

  describe '#validate_phase' do
    it 'sets no errors when voting_max_total is present' do
      phase.voting_max_total = 10
      voting_method.validate_phase
      expect(phase.errors.details).to be_blank
    end

    it 'sets an error when voting_max_total is blank' do
      phase.voting_max_total = nil
      voting_method.validate_phase
      expect(phase.errors.details).to eq(
        voting_max_total: [error: :blank]
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
      project = create(:single_phase_multiple_voting_project)
      idea = create(:idea, budget: 3, project: project, phases: project.phases)
      baskets_idea = create(:baskets_idea, basket: create(:basket, phase: project.phases.first), idea: idea, votes: 10)

      voting_method.assign_baskets_idea(baskets_idea.reload)
      baskets_idea.save!

      expect(baskets_idea.votes).to eq 10
    end
  end

  describe '#votes_for_idea' do
    let(:other_voting_phase) { create(:multiple_voting_phase, project: phase.project, start_at: phase.end_at + 1.day, end_at: phase.end_at + 10.days) }

    before do
      create(:baskets_idea, basket: create(:basket, phase: phase), idea: idea, votes: 3)
      create(:baskets_idea, basket: create(:basket, phase: phase), idea: idea, votes: 1)
      create(:baskets_idea, basket: create(:basket, phase: other_voting_phase), idea: idea, votes: 2)
      Basket.update_counts(phase)
    end

    context 'when the idea is in the voting phase' do
      let(:idea) { create(:idea, project: phase.project, phases: [phase, other_voting_phase]) }

      it 'returns the votes for the idea' do
        expect(voting_method.votes_for_idea(idea)).to eq 4
      end
    end

    context 'when the idea is not in the voting phase' do
      let(:idea) { create(:idea, project: phase.project, phases: [other_voting_phase]) }

      it 'returns 0' do
        expect(voting_method.votes_for_idea(idea)).to eq 0
      end
    end
  end

  describe '#supports_serializing?' do
    it 'returns true for voting attributes' do
      %i[
        voting_method voting_max_total voting_min_total voting_max_votes_per_idea baskets_count
        voting_term_singular_multiloc voting_term_plural_multiloc votes_count total_votes_amount
        autoshare_results_enabled
      ].each do |attribute|
        expect(voting_method.supports_serializing?(attribute)).to be true
      end
    end
  end
end
