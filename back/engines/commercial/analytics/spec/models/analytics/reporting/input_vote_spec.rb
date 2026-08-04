# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::InputVote do
  it 'exposes one row per vote in a submitted basket, with its weight' do
    # in a budgeting basket the vote magnitude is the idea's allocated budget
    baskets_idea = create(:baskets_idea).reload
    row = described_class.find(baskets_idea.id)

    expect(row.input_id).to eq baskets_idea.idea_id
    expect(row.user_id).to eq baskets_idea.basket.user_id
    expect(row.voted_at).to eq baskets_idea.basket.submitted_at
    expect(row.weight).to eq baskets_idea.votes
    expect(row.weight).to eq baskets_idea.idea.budget
  end

  it 'excludes votes in unsubmitted baskets' do
    create(:baskets_idea, basket: create(:basket, submitted_at: nil))

    expect(described_class.count).to eq 0
  end
end
