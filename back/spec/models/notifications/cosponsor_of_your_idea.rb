# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::CosponsorOfYourIdea do
  describe 'cosponsor_of_your_idea' do
    it 'makes a notification on input_cosponsorship_accepted cosponsorship activity' do
      idea = create(:idea, author: create(:user))
      cosponsorship = create(:cosponsorship, idea: idea, status: 'accepted')
      activity = create(
        :activity,
        item: cosponsorship,
        user_id: cosponsorship.user_id,
        action: 'input_cosponsorship_accepted'
      )

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: idea.author_id,
        initiating_user: cosponsorship.user,
        post: idea
      )
    end
  end
end
