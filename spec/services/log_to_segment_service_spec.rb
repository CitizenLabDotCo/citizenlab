require "rails_helper"

describe LogToSegmentService do
  let(:service) { LogToSegmentService.new }

  describe "integrations" do
    it "logs to all destinations by default" do
      user = build_stubbed(:user)
      expect(service.integrations(user)[:All]).to be true
    end

    it "doesn't include intercom for a super admin" do
      user = build_stubbed(:admin, email: "hello@citizenlab.co")
      expect(service.integrations(user)[:Intercom]).to be false
    end

    it "includes intercom for an admin" do
      user = build_stubbed(:admin)
      expect(service.integrations(user)[:Intercom]).to be true
    end

    it "includes intercom for a project moderator" do
      user = build_stubbed(:moderator)
      expect(service.integrations(user)[:Intercom]).to be true
    end

    it "doesn't include intercom for a normal user" do
      user = build_stubbed(:user)
      expect(service.integrations(user)[:Intercom]).to be false
    end

    it "doesn't include SatisMeter for a super admin" do
      user = build_stubbed(:admin, email: "hello@citizenlab.co")
      expect(service.integrations(user)[:SatisMeter]).to be false
    end

    it "includes SatisMeter for an admin" do
      user = build_stubbed(:admin)
      expect(service.integrations(user)[:SatisMeter]).to be true
    end

    it "includes SatisMeter for a project moderator" do
      user = build_stubbed(:moderator)
      expect(service.integrations(user)[:SatisMeter]).to be true
    end

    it "doesn't include SatisMeter for a normal user" do
      user = build_stubbed(:user)
      expect(service.integrations(user)[:SatisMeter]).to be false
    end
  end
end
