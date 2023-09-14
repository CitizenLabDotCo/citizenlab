# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::VotingBasketNotSubmitted do
  describe 'make_notifications_on' do
    it 'makes a notification when a basket is flagged as not submitted' do
      basket = create(:basket)
      activity = create(:activity, item: basket, action: 'not_submitted')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: basket.user_id,
        basket: basket
      )
    end
  end
end
