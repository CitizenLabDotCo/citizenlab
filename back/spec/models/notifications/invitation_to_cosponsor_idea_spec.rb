# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InvitationToCosponsorIdea do
  describe 'invitation_to_cosponsor_idea' do
    it 'makes a notification on created cosponsorship activity' do
      idea = create(:idea, author: create(:user))
      cosponsorship = create(:cosponsorship, idea: idea, user: create(:user))
      activity = create(:activity, item: cosponsorship, user_id: idea.author.id, action: 'created')

      notifications = described_class.make_notifications_on activity
      expect(notifications.count).to eq 1
      expect(notifications.first).to have_attributes(
        recipient_id: cosponsorship.user_id,
        initiating_user: cosponsorship.idea.author,
        idea: idea
      )
    end
  end
end
