# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::ScopedReportingToken do
  let(:layout) { create(:layout) }
  let(:user) { create(:admin) }

  describe '.permits?' do
    it 'permits the layout it was minted for' do
      token = described_class.mint(layout_id: layout.id, user_id: user.id)

      expect(described_class.permits?(token, layout_id: layout.id)).to be true
    end

    # The whole point of scoping it: a browser running generated code gets one layout.
    it 'refuses a different layout' do
      token = described_class.mint(layout_id: layout.id, user_id: user.id)

      expect(described_class.permits?(token, layout_id: create(:layout).id)).to be false
    end

    it 'refuses once it has expired' do
      token = described_class.mint(layout_id: layout.id, user_id: user.id, ttl: 1.second)

      travel_to(2.seconds.from_now) do
        expect(described_class.permits?(token, layout_id: layout.id)).to be false
      end
    end

    it 'refuses a token signed with something else' do
      forged = JWT.encode(
        { scope: described_class::SCOPE, layout_id: layout.id, tenant: Tenant.current.id,
          exp: 10.minutes.from_now.to_i },
        'not the app secret', 'HS256'
      )

      expect(described_class.permits?(forged, layout_id: layout.id)).to be false
    end

    it 'refuses a token minted for another tenant' do
      token = described_class.mint(layout_id: layout.id, user_id: user.id)
      allow(Tenant).to receive(:current).and_return(instance_double(Tenant, id: SecureRandom.uuid))

      expect(described_class.permits?(token, layout_id: layout.id)).to be false
    end

    # Fail closed on anything unreadable (BE-6).
    it 'refuses nonsense, nil and blank' do
      [nil, '', 'not-a-jwt'].each do |candidate|
        expect(described_class.permits?(candidate, layout_id: layout.id)).to be false
      end
    end

    it 'refuses when no layout is asked about' do
      token = described_class.mint(layout_id: layout.id, user_id: user.id)

      expect(described_class.permits?(token, layout_id: nil)).to be false
    end
  end
end
