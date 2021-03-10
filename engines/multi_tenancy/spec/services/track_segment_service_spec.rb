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
    it "includes tenant properties in the Segment's identify payload" do
      user = create(:user)

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
    it 'includes tenant/environment properties in activity events' do
      user = create(:user)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)

      expect(SEGMENT_CLIENT).to receive(:track) do |event|
        expect(event[:properties]).to match(hash_including(
          cl2_cluster: 'local',
          **expected_tenant_props,
        ))
      end

      service.track_activity(activity)
    end
  end
end
