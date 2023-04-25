# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PublishGenericEventToRabbitJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    let(:bunny) { instance_double(Bunny::Session) }
    let(:routing_key) { 'routing_key' }
    let(:generic_event) { { field1: 'value1', field2: 'value2' } }

    it 'actually publishes the event to RabbitMQ' do
      expect(job).to receive(:publish_to_rabbitmq) do |_bunny, event, actual_routing_key|
        expect(event).to include(generic_event)
        expect(actual_routing_key).to eq(routing_key)
      end

      job.perform(generic_event, routing_key, bunny)
    end
  end
end
