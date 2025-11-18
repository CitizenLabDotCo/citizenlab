require 'rails_helper'

describe PhaseInsightsService do
  let(:service) { described_class.new }

  let(:participation) { create(:basket_participation, :with_votes, vote_count: 15) }

  it 'does a thing' do
    expect(participation).to match({
      id: be_a(String),
      action: 'voting',
      acted_at: be_a(Time),
      classname: 'Basket',
      user_id: be_a(String),
      user_custom_field_values: {},
      votes: 15
    })
  end
end
