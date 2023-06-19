# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::OfficialFeedbackOnReactedInitiative do
  describe 'make_notifications_on' do
    it 'generates exactly one notification for each user that reacted on the initiative' do
      initiative = create(:initiative)
      reaction1 = create(:reaction, reactable: initiative)
      reaction2 = create(:reaction, reactable: initiative)
      create(:reaction)

      official_feedback = create(:official_feedback, post: initiative)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications.map(&:recipient)).to match_array [reaction1.user, reaction2.user]
    end
  end
end
