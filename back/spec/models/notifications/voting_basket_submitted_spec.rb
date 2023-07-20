# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::VotingBasketSubmitted do
  describe 'make_notifications_on' do
    it 'makes a notification when a basket is submitted' do
      basket = create(:basket)
      activity = create(:activity, item: basket, action: 'submitted')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: basket.user_id,
        basket: basket
      )
    end
  end
end
