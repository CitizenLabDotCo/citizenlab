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
        timestamp: '2025-10-22T10:30:00Z'
      )
      expect(payload[:event]).to be_present
      expect(payload[:data]).to be_present
      expect(payload[:metadata]).to be_present
    end

    it 'includes correct event name' do
      payload = described_class.new.generate(activity)
      expect(payload[:event]).to eq('Idea created')
    end

    it 'includes correct event_type' do
      payload = described_class.new.generate(activity)
      expect(payload[:event_type]).to eq('idea.created')
    end

    it 'includes ISO8601 formatted timestamp' do
      payload = described_class.new.generate(activity)
      expect(payload[:timestamp]).to match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    end

    it 'includes metadata with all fields' do
      payload = described_class.new.generate(activity)

      expect(payload[:metadata]).to include(
        item_type: 'Idea',
        item_id: idea.id,
        action: 'created',
        user_id: user.id,
        project_id: project.id,
        tenant_id: Tenant.current.id
      )
    end

    it 'serializes the item data using external serializer' do
      payload = described_class.new.generate(activity)

      expect(payload[:data]).to be_present
      expect(payload[:data]).to have_key(:id)
      expect(payload[:data]).to have_key(:type)
      expect(payload[:data][:id]).to eq(idea.id)
    end

    it 'handles activity without item gracefully' do
      activity_without_item = create(:activity, item: nil)

      payload = described_class.new.generate(activity_without_item)

      expect(payload[:data]).to eq({})
      expect(payload[:metadata]).to be_present
    end

    it 'handles activity with deleted item' do
      activity.update_column(:item_id, nil)
      activity.item = nil

      payload = described_class.new.generate(activity)

      expect(payload[:data]).to eq({})
    end

    it 'handles missing serializer gracefully' do
      # Create activity for item type without external serializer
      custom_activity = create(:activity,
        item_type: 'UnknownType',
        item_id: SecureRandom.uuid,
        action: 'created')

      payload = described_class.new.generate(custom_activity)

      expect(payload[:data]).to eq({})
      expect(payload[:event_type]).to eq('unknown_type.created')
    end

    it 'generates consistent payload for same activity' do
      payload1 = described_class.new.generate(activity)
      payload2 = described_class.new.generate(activity)

      expect(payload1).to eq(payload2)
    end

    describe 'different event types' do
      it 'generates payload for idea.published' do
        published_activity = create(:idea_published_activity,
          item: idea,
          user: user,
          project_id: project.id)

        payload = described_class.new.generate(published_activity)

        expect(payload[:event_type]).to eq('idea.published')
        expect(payload[:metadata][:action]).to eq('published')
      end

      it 'generates payload for idea.changed' do
        changed_activity = create(:idea_changed_activity,
          item: idea,
          user: user,
          project_id: project.id)

        payload = described_class.new.generate(changed_activity)

        expect(payload[:event_type]).to eq('idea.changed')
      end

      it 'generates payload for user.created' do
        user_activity = create(:activity,
          item: user,
          item_type: 'User',
          action: 'created',
          user: user)

        payload = described_class.new.generate(user_activity)

        expect(payload[:event_type]).to eq('user.created')
        expect(payload[:metadata][:item_type]).to eq('User')
      end
    end
  end
end
