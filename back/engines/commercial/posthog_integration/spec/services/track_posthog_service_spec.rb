# frozen_string_literal: true

require 'rails_helper'

describe PosthogIntegration::TrackPosthogService do
  let(:posthog) { instance_double(PostHog::Client) }
  let(:service) { described_class.new(posthog) }

  describe 'identify_user' do
    it "doesn't interact with Posthog when the given user is not an admin or moderator" do
      user = build(:user)

      expect(posthog).not_to receive(:identify)

      service.identify_user(user)
    end

    it 'tracks admins, moderators and super admins' do
      admin = build(:admin)
      project_moderator = build(:project_moderator)
      folder_moderator = build(:project_folder_moderator)
      super_admin = build(:super_admin)

      expect(posthog).to receive(:identify).exactly(4).times

      service.identify_user(admin)
      service.identify_user(project_moderator)
      service.identify_user(folder_moderator)
      service.identify_user(super_admin)
    end

    it 'passes the right arguments to indetify' do
      admin = create(:admin)

      expect(posthog).to receive(:identify).with(
        distinct_id: admin.id,
        properties: hash_including({
          email: admin.email,
          name: admin.full_name,
          first_name: admin.first_name,
          last_name: admin.last_name,
          locale: 'en',
          highest_role: 'admin'
        })
      )

      service.identify_user(admin)
    end
  end

  describe 'track_activity' do
    it "doesn't interact with posthog for normal users" do
      user = build(:user)

      expect(posthog).not_to receive(:capture)

      service.track_activity(build(:activity, user: user))
    end

    it 'sends the activity to posthog' do
      admin = create(:admin)
      activity = build(:activity, user: admin)

      expect(posthog).to receive(:capture).with({
        distinct_id: admin.id,
        event: 'Idea published',
        timestamp: activity.acted_at,
        properties: hash_including(
          source: 'cl2-back',
          item_id: activity.item_id,
          item_type: activity.item_type,
          action: 'published'
        ),
        groups: {
          tenant: AppConfiguration.instance.id
        }
      })

      service.track_activity(activity)
    end
  end

  describe 'identify_tenant' do
    it 'updates/creates the tenant as a group in posthog' do
      tenant = Tenant.current
      expect(posthog).to receive(:group_identify).with({
        group_type: 'tenant',
        group_key: tenant.id,
        properties: {
          name: 'test-tenant',
          host: 'example.org',
          lifecycle_stage: 'active',
          cluster: 'local'
        }
      })
      service.identify_tenant(tenant)
    end
  end
end
