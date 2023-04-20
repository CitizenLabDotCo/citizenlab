# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactEmailDelivery do
  context 'when an email is sent' do
    let!(:campaign) { create(:comment_on_your_idea_campaign) }
    let!(:delivery) { create(:delivery, campaign: campaign) }

    it 'is also available as a email delivery fact' do
      described_class.find(delivery.id)
    end
  end
end
