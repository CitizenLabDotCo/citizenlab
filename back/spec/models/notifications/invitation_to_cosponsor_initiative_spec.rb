# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InvitationToCosponsorInitiative do
  describe 'invitation_to_cosponsor_initiative' do
    it 'makes a notification on created cosponsors_initiative activity' do
      initiative = create(:initiative, author: create(:user))
      cosponsors_initiative = create(:cosponsors_initiative, initiative: initiative)
      activity = create(:activity, item: cosponsors_initiative, user_id: initiative.author.id, action: 'created')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: cosponsors_initiative.user_id,
        initiating_user: cosponsors_initiative.initiative.author,
        post: initiative
      )
    end
  end
end
