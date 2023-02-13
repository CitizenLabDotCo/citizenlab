# frozen_string_literal: true

require 'rails_helper'

describe TrackSegmentService do
  let(:service) { described_class.new }
  let(:tenant) { Tenant.current }
  let(:expected_tenant_props) do
    {
      tenantId: Tenant.current.id,
      tenantName: 'test-tenant',
      tenantHost: 'example.org',
      tenantOrganizationType: 'medium_city',
      tenantLifecycleStage: 'active'
    }
  end

  describe 'identify_user' do
    it 'does not track normal users' do
      user = create(:user)
      expect(SEGMENT_CLIENT).not_to receive(:identify)
      service.identify_user(user)
    end

    it 'track super admins' do
      user = create(:super_admin)
      expect(SEGMENT_CLIENT).to receive(:identify)
      service.identify_user(user)
    end

    it 'tracks admins' do
      user = create(:admin)
      expect(SEGMENT_CLIENT).to receive(:identify)
      service.identify_user(user)
    end

    it 'tracks project moderators' do
      user = create(:project_moderator)
      expect(SEGMENT_CLIENT).to receive(:identify)
      service.identify_user(user)
    end

    it "includes tenant properties in the Segment's identify payload" do
      user = create(:admin)

      expect(SEGMENT_CLIENT).to receive(:identify) do |identification|
        expect(identification[:traits]).to include(expected_tenant_props)
      end

      service.identify_user(user)
    end
  end

  describe 'identify_tenant' do
    it "calls Segment's `group` method with the correct payload" do
      expect(SEGMENT_CLIENT).to receive(:group).with(
        user_id: anything, # we don't care about the user id when tracking a tenant
        group_id: Tenant.current.id,
        traits: {
          name: 'test-tenant',
          website: 'https://example.org',
          avatar: nil,
          createdAt: Tenant.current.created_at,
          tenantLocales: %w[en fr-FR nl-NL],
          **expected_tenant_props
        },
        integrations: {
          All: true,
          Intercom: true,
          SatisMeter: true
        }
      )

      service.identify_tenant(tenant)
    end
  end

  describe 'track_activity' do
    it 'does not track activities initiated by normal users' do
      user = create(:user)
      activity = create(:activity, user: user)

      expect(SEGMENT_CLIENT).not_to receive(:track)

      service.track_activity(activity)
    end

    it 'includes tenant/environment properties in activity events' do
      user = create(:admin)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)

      expect(SEGMENT_CLIENT).to receive(:track) do |event|
        expect(event[:properties]).to match(hash_including(
          cl2_cluster: 'local',
          **expected_tenant_props
        ))
      end

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
        [:super_admin, true],
      ]
    end

    with_them do
      it "returns #{params[:is_tracked]} for #{params[:user_factory].to_s.pluralize}" do
        user = create(user_factory)
        expect(service.send(:track_user?, user)).to eq(is_tracked)
      end
    end
  end
end
