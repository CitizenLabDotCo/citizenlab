# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PublishGenericEventToRabbitJob, type: :job do
  subject(:job) { described_class.new }

  describe '#perform' do
    let(:bunny) { instance_double(Bunny::Session) }
    let(:routing_key) { 'routing_key' }
    let(:generic_event) { { field_1: 'value1', field_2: 'value2' } }

    it 'include tenant properties in RabbitMQ events' do
      tenant_properties = MultiTenancy::TrackingTenantService.new.tenant_properties

      expect(job).to receive(:publish_to_rabbitmq) do |_bunny, event, _routing_key|
        expect(event).to include(tenant_properties)
      end

      job.perform(generic_event, routing_key, bunny)
    end
  end
end
