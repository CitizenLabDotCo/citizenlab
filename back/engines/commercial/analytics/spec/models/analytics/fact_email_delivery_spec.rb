# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactEmailDelivery do
  context 'when an email is sent' do
    let_it_be(:campaign, reload: true) { create(:comment_on_idea_you_follow_campaign) }
    let_it_be(:delivery, reload: true) { create(:delivery, campaign: campaign) }

    it 'is also available as a email delivery fact' do
      expect { described_class.find(delivery.id) }.not_to raise_error
    end
  end
end
