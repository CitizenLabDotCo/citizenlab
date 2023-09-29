# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::CosponsorOfYourInitiative do
  describe 'cosponsor_of_your_initiative' do
    it 'makes a notification on cosponsorship_accepted cosponsors_initiative activity' do
      initiative = create(:initiative, author: create(:user))
      cosponsors_initiative = create(:cosponsors_initiative, initiative: initiative, status: 'accepted')
      activity = create(
        :activity,
        item: cosponsors_initiative,
        user_id: cosponsors_initiative.user_id,
        action: 'cosponsorship_accepted'
      )

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: initiative.author_id,
        initiating_user: cosponsors_initiative.user,
        post: initiative
      )
    end
  end
end
