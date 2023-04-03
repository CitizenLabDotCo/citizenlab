# frozen_string_literal: true

require 'rails_helper'

describe TrackSegmentService do
  let(:segment_client) { instance_double(SimpleSegment::Client, 'segment_client') }
  let(:service) { described_class.new(segment_client) }

  def activate_planhat_feature(bool = true) # rubocop:disable Style/OptionalBooleanParameter
    app_config = AppConfiguration.instance
    settings = app_config.settings
    settings['segment'] = { 'allowed' => bool, 'enabled' => bool }
    settings['planhat'] = { 'allowed' => bool, 'enabled' => bool }
    app_config.update!(settings: settings)
  end

  describe 'integrations' do
    context do
      where(:user_factory, :is_included) do
        [
          [:user, false],
          [:project_moderator, true],
          [:project_folder_moderator, true],
          [:admin, true],
          [:super_admin, false]
        ]
      end

      with_them do
        user_category = params[:user_factory].to_s.pluralize.tr('_', ' ')
        includes = params[:is_included] ? 'includes' : 'does not include'

        let(:user) { build(user_factory) }

        it "#{includes} All for #{user_category}" do
          expect(service.integrations(user)[:All]).to eq(is_included)
        end

        it "#{includes} Intercom for #{user_category}" do
          expect(service.integrations(user)[:Intercom]).to eq(is_included)
        end

        it "#{includes} Satismeter for #{user_category}" do
          expect(service.integrations(user)[:SatisMeter]).to eq(is_included)
        end

        context 'when Planhat feature is enabled' do
          before_all { activate_planhat_feature }

          it "#{includes} Planhat for #{user_category}" do
            expect(service.integrations(user)[:Planhat]).to eq(is_included)
          end
        end
      end
    end

    context 'when Planhat feature is disabled' do
      before_all { activate_planhat_feature(false) }
      before_all do
        app_config = AppConfiguration.instance
        settings = app_config.settings
        settings['segment'] = { 'allowed' => false, 'enabled' => false }
        settings['planhat'] = { 'allowed' => false, 'enabled' => false }
        app_config.update(settings: settings)
      end

      where(:user_factory) do
        %i[
          user
          project_moderator
          project_folder_moderator
          admin
          super_admin
        ]
      end

      with_them do
        user_category = params[:user_factory].to_s.pluralize.tr('_', ' ')

        it "does not include Planhat for #{user_category}" do
          user = build(user_factory)
          expect(service.integrations(user)[:Planhat]).to be false
        end
      end
    end
  end

  describe 'identify_user' do
    it 'does not track normal users' do
      user = create(:user)
      expect(SEGMENT_CLIENT).not_to receive(:identify)
      service.identify_user(user)
    end

    it 'does not track super admins' do
      user = create(:super_admin)
      expect(segment_client).not_to receive(:identify)
      service.identify_user(user)
    end

    it 'tracks admins' do
      user = create(:admin)
      expect(segment_client).to receive(:identify)
      service.identify_user(user)
    end

    it 'tracks project moderators' do
      user = create(:project_moderator)
      expect(segment_client).to receive(:identify)
      service.identify_user(user)
    end

    it "calls segment's `identify` method with the correct payload" do
      activate_planhat_feature

      user = create(:admin)

      expect(segment_client).to receive(:identify).with(
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
          isAdmin: true,
          isProjectModerator: false,
          highestRole: :admin,
          timezone: 'Brussels'
        ),
        integrations: {
          All: true,
          Intercom: true,
          SatisMeter: true,
          Planhat: true
        }
      )

      service.identify_user(user)
    end
  end

  describe 'track_activity' do
    it 'does not track activities initiated by normal users' do
      user = create(:user)
      activity = create(:activity, user: user)

      expect(segment_client).not_to receive(:track)

      service.track_activity(activity)
    end

    it 'generates an event with the desired content for (normal) activities' do
      activate_planhat_feature(false)

      user = create(:admin)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)

      expect(segment_client).to receive(:track).with(
        hash_including(
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
            Intercom: true,
            SatisMeter: true,
            Planhat: false
          }
        )
      )

      service.track_activity(activity)
    end

    it 'generates an event with the desired content for activities about notifications' do
      user = create(:admin)
      notification = create(:comment_on_your_comment, recipient: user)
      activity = create(:activity, item: notification, item_type: notification.type, action: 'created', user: user)
      activity.update!(item_type: notification.class.name)

      expect(segment_client).to receive(:track).with(
        hash_including(
          event: 'Notification for Comment on your comment created',
          user_id: user.id,
          properties: hash_including(
            source: 'cl2-back',
            action: 'created',
            item_id: notification.id,
            item_type: 'Notifications::CommentOnYourComment'
          )
        )
      )

      service.track_activity(activity)
    end
  end

  describe '#track_user' do
    where(:user_factory, :is_tracked) do
      [
        [:user, false],
        [:project_moderator, true],
        [:project_folder_moderator, true],
        [:admin, true],
        [:super_admin, false]
      ]
    end

    with_them do
      it "returns #{params[:is_tracked]} for #{params[:user_factory].to_s.pluralize}" do
        user = build(user_factory)
        expect(service.send(:track_user?, user)).to eq(is_tracked)
      end
    end
  end
end
