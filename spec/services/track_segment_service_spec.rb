# frozen_string_literal: true

require 'rails_helper'

describe TrackSegmentService do
  let(:service) { described_class.new }

  describe 'integrations' do
    it 'logs to all destinations by default' do
      user = build_stubbed(:user)
      expect(service.integrations(user)[:All]).to be true
    end

    it "doesn't include intercom for a super admin" do
      user = build_stubbed(:admin, email: 'hello@citizenlab.co')
      expect(service.integrations(user)[:Intercom]).to be false
    end

    it 'includes intercom for an admin' do
      user = build_stubbed(:admin)
      expect(service.integrations(user)[:Intercom]).to be true
    end

    it 'includes intercom for a project moderator' do
      user = build_stubbed(:moderator)
      expect(service.integrations(user)[:Intercom]).to be true
    end

    it "doesn't include intercom for a normal user" do
      user = build_stubbed(:user)
      expect(service.integrations(user)[:Intercom]).to be false
    end

    it "doesn't include SatisMeter for a super admin" do
      user = build_stubbed(:admin, email: 'hello@citizenlab.co')
      expect(service.integrations(user)[:SatisMeter]).to be false
    end

    it 'includes SatisMeter for an admin' do
      user = build_stubbed(:admin)
      expect(service.integrations(user)[:SatisMeter]).to be true
    end

    it 'includes SatisMeter for a project moderator' do
      user = build_stubbed(:moderator)
      expect(service.integrations(user)[:SatisMeter]).to be true
    end

    it "doesn't include SatisMeter for a normal user" do
      user = build_stubbed(:user)
      expect(service.integrations(user)[:SatisMeter]).to be false
    end
  end

  describe 'identify_user' do
    it "calls segment's identify() method with the correct payload" do
      user = create(:user)

      expect(SEGMENT_CLIENT).to receive(:identify).with(
        user_id: user.id,
        traits: hash_including(
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at,
          locale: 'en',
          birthday: nil,
          gender: nil,
          isSuperAdmin: false,
          isAdmin: false,
          isProjectModerator: false,
          highestRole: :user,
          timezone: 'Brussels'
        ),
        integrations: {
          All: true,
          Intercom: false,
          SatisMeter: false
        }
      )

      service.identify_user(user)
    end
  end

  describe 'track_activity' do
    it 'generates an event with the desired content for (normal) activities' do
      user = create(:user)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)

      expect(SEGMENT_CLIENT).to receive(:track).with(hash_including(
                                                       event: 'Comment created',
                                                       user_id: user.id,
                                                       properties: hash_including(
                                                         source: 'cl2-back',
                                                         action: 'created',
                                                         item_id: comment.id,
                                                         item_type: 'Comment',
                                                         item_content: hash_including(comment: hash_including(id: comment.id))
                                                       ),
                                                       integrations: {
                                                         All: true,
                                                         Intercom: false,
                                                         SatisMeter: false
                                                       }
                                                     ))

      service.track_activity(activity)
    end

    it 'generates an event with the desired content for activities about notifications' do
      user = create(:user)
      notification = create(:comment_on_your_comment, recipient: user)
      activity = create(:activity, item: notification, item_type: notification.type, action: 'created', user: user)
      activity.update!(item_type: notification.class.name)

      expect(SEGMENT_CLIENT).to receive(:track).with(hash_including(
                                                       event: 'Notification for Comment on your comment created',
                                                       user_id: user.id,
                                                       properties: hash_including(
                                                         source: 'cl2-back',
                                                         action: 'created',
                                                         item_id: notification.id,
                                                         item_type: 'Notifications::CommentOnYourComment'
                                                       )
                                                     ))

      service.track_activity(activity)
    end
  end
end
