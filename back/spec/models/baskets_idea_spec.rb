# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BasketsIdea do
  context 'Default factory' do
    it 'is valid' do
      expect(build(:baskets_idea)).to be_valid
    end
  end

  it 'cannot exceed the maximum votes per idea' do
    phase = create(:voting_phase, voting_method: 'multiple_voting', voting_max_votes_per_idea: 3)
    basket = create(:basket, participation_context: phase)
    idea = create(:idea, project: phase.project, phases: [phase])
    baskets_idea = build(:baskets_idea, basket: basket, idea: idea, votes: 4)

    expect(baskets_idea.save).to be false
    expect(baskets_idea.errors.details).to eq({ votes: [{ error: :less_than_or_equal_to, value: 4, count: 3 }] })
    expect(baskets_idea.errors.messages).to eq({ votes: ['must be less than or equal to 3'] })
  end
end
