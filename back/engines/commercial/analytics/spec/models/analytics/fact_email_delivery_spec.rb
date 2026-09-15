# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactEmailDelivery do
  context 'when an email is sent' do
    let!(:campaign) { create(:comment_on_idea_you_follow_campaign) }
    let!(:delivery) { create(:delivery, campaign: campaign) }

    it 'is also available as a email delivery fact' do
      expect { described_class.find(delivery.id) }.not_to raise_error
    end

    it 'references the recipient as the user dimension' do
      fact = described_class.find(delivery.id)
      expect(fact.dimension_user_id).to eq(delivery.user_id)
      expect(fact.dimension_user).to eq(Analytics::DimensionUser.find(delivery.user_id))
    end
  end
end
