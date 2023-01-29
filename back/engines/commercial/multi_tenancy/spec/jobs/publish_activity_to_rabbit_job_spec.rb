# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PublishActivityToRabbitJob, type: :job do
  subject(:job) { described_class.new }

  describe '#perform' do
    it 'generates an event including environment properties' do
      user = create(:user)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)

      expect(PublishGenericEventToRabbitJob).to receive(:perform_now) do |event, _routing_key|
        expect(event).to include(MultiTenancy::TrackingTenantService.new.environment_properties)
      end

      job.perform activity
    end
  end
end
