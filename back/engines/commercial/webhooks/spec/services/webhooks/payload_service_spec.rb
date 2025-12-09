# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::PayloadService do
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:idea) { create(:idea, author: user, project: project) }
  let(:activity) do
    create(:idea_created_activity,
      item: idea,
      user: user,
      project_id: project.id,
      acted_at: Time.zone.parse('2025-10-22 10:30:00'))
  end

  describe '#generate' do
    it 'generates webhook payload with all required fields' do
      payload = described_class.new.generate(activity)

      expect(payload).to include(
        id: activity.id,
        event_type: 'idea.created',
        acted_at: '2025-10-22T10:30:00Z',
        item_type: 'Idea',
        item_id: idea.id,
        action: 'created',
        user_id: user.id,
        project_id: project.id,
        tenant_id: Tenant.current.id
      )
    end

    it 'includes correct event_type' do
      payload = described_class.new.generate(activity)
      expect(payload[:event_type]).to eq('idea.created')
    end

    it 'includes ISO8601 formatted acted_at' do
      payload = described_class.new.generate(activity)
      expect(payload[:acted_at]).to match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    end

    it 'serializes the item data using PublicApi::V2 serializer' do
      payload = described_class.new.generate(activity)

      expect(payload[:item]).to be_present
      expect(payload[:item]).to have_key(:id)
      expect(payload[:item]).to have_key(:author_id)
      expect(payload[:item][:id]).to eq(idea.id)
    end

    it 'handles missing serializer gracefully' do
      # Create activity for item type without external serializer
      custom_activity = create(:activity,
        item_type: 'Experiment',
        item_id: SecureRandom.uuid,
        action: 'created')

      payload = described_class.new.generate(custom_activity)

      expect(payload[:item]).to eq({})
      expect(payload[:event_type]).to eq('experiment.created')
    end
  end
end
