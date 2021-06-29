# frozen_string_literal: true

require 'rails_helper'

describe TrackSegmentService do
  let(:segment_client) { instance_double(SimpleSegment::Client) }
  let(:service) { described_class.new(segment_client) }

  describe 'integrations' do
    it 'includes intercom for a project moderator' do
      user = build_stubbed(:project_moderator)
      expect(service.integrations(user)[:Intercom]).to be true
    end

    it 'includes SatisMeter for a project moderator' do
      user = build_stubbed(:project_moderator)
      expect(service.integrations(user)[:SatisMeter]).to be true
    end
  end

  describe 'identify_user' do
    it "calls segment's identify() method with the correct payload" do
      user = create(:user)

      expect(segment_client).to receive(:identify).with(
        hash_including(traits: hash_including(isProjectModerator: false))
      )

      service.identify_user(user)
    end
  end
end


