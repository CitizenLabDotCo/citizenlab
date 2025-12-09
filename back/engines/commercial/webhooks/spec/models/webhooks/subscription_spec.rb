# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::Subscription do
  before do
    allow(Resolv).to receive(:getaddresses).with(a_string_matching(/webhook.example.com.*/)).and_return(['93.184.216.34'])
  end

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:webhook_subscription)).to be_valid
    end
  end

  describe 'validations' do
    it 'requires a name' do
      subscription = build(:webhook_subscription, name: nil)
      expect(subscription).not_to be_valid
      expect(subscription.errors[:name]).to be_present
    end

    it 'requires a URL' do
      subscription = build(:webhook_subscription, url: nil)
      expect(subscription).not_to be_valid
      expect(subscription.errors[:url]).to be_present
    end

    it 'requires events' do
      subscription = build(:webhook_subscription, events: [])
      expect(subscription).not_to be_valid
      expect(subscription.errors[:events]).to be_present
    end

    it 'requires a valid URL' do
      subscription = build(:webhook_subscription, url: 'not-a-url')
      expect(subscription).not_to be_valid
    end

    it 'validates supported events' do
      subscription = build(:webhook_subscription, events: ['idea.created', 'invalid.event'])
      expect(subscription).not_to be_valid
      expect(subscription.errors[:events]).to include('contains unsupported event types: invalid.event')
    end

    it 'accepts all supported events' do
      subscription = build(:webhook_subscription,
        events: ['idea.created', 'idea.published', 'idea.changed', 'user.created'])
      expect(subscription).to be_valid
    end
  end

  describe 'callbacks' do
    it 'generates secret_token on create' do
      subscription = build(:webhook_subscription, secret_token: nil)
      subscription.save!
      expect(subscription.secret_token).to be_present
      expect(subscription.secret_token.length).to be > 20
    end

    it 'does not overwrite existing secret_token' do
      token = 'existing_token'
      subscription = create(:webhook_subscription, secret_token: token)
      expect(subscription.secret_token).to eq(token)
    end
  end

  describe 'associations' do
    it 'can have a project' do
      project = create(:project)
      subscription = create(:webhook_subscription, project: project)
      expect(subscription.project).to eq(project)
    end

    it 'can have deliveries' do
      subscription = create(:webhook_subscription)
      delivery = create(:webhook_delivery, subscription: subscription)
      expect(subscription.deliveries).to include(delivery)
    end

    it 'destroys deliveries when destroyed' do
      subscription = create(:webhook_subscription)
      create(:webhook_delivery, subscription: subscription)

      expect { subscription.destroy! }.to change(Webhooks::Delivery, :count).by(-1)
    end

    it 'gets destroyed when project is destroyed' do
      project = create(:project)
      create(:webhook_subscription, project: project)

      expect { project.destroy! }.to change(described_class, :count).by(-1)
    end
  end

  describe 'scopes' do
    describe '.enabled' do
      it 'returns only enabled subscriptions' do
        enabled = create(:webhook_subscription, enabled: true)
        disabled = create(:webhook_subscription, :disabled)

        expect(described_class.enabled).to include(enabled)
        expect(described_class.enabled).not_to include(disabled)
      end
    end

    describe '.for_event' do
      it 'returns subscriptions listening to the event' do
        sub1 = create(:webhook_subscription, events: ['idea.created'])
        sub2 = create(:webhook_subscription, events: ['user.created'])

        results = described_class.for_event('idea.created')
        expect(results).to include(sub1)
        expect(results).not_to include(sub2)
      end

      it 'handles multiple events per subscription' do
        sub = create(:webhook_subscription, events: ['idea.created', 'idea.published'])

        expect(described_class.for_event('idea.created')).to include(sub)
        expect(described_class.for_event('idea.published')).to include(sub)
        expect(described_class.for_event('user.created')).not_to include(sub)
      end
    end

    describe '.for_project' do
      it 'returns subscriptions with matching project' do
        project = create(:project)
        sub1 = create(:webhook_subscription, project: project)
        sub2 = create(:webhook_subscription, project: nil)
        sub3 = create(:webhook_subscription, project: create(:project))

        results = described_class.for_project(project.id)
        expect(results).to include(sub1, sub2) # nil project_id matches all
        expect(results).not_to include(sub3)
      end
    end
  end

  describe '#matches_event?' do
    it 'returns true when event is in subscription events' do
      subscription = create(:webhook_subscription, events: ['idea.created', 'idea.published'])
      expect(subscription.matches_event?('idea.created')).to be true
    end

    it 'returns false when event is not in subscription events' do
      subscription = create(:webhook_subscription, events: ['idea.created'])
      expect(subscription.matches_event?('user.created')).to be false
    end
  end

  describe '#matches_project?' do
    it 'matches when subscription has no project filter' do
      subscription = create(:webhook_subscription, project: nil)
      expect(subscription.matches_project?('any-project-id')).to be true
    end

    it 'matches when activity has no project' do
      subscription = create(:webhook_subscription, :with_project)
      expect(subscription.matches_project?(nil)).to be true
    end

    it 'matches when projects are the same' do
      project = create(:project)
      subscription = create(:webhook_subscription, project: project)
      expect(subscription.matches_project?(project.id)).to be true
    end

    it 'does not match when projects differ' do
      subscription = create(:webhook_subscription, :with_project)
      different_project = create(:project)
      expect(subscription.matches_project?(different_project.id)).to be false
    end
  end

  describe '.any_enabled?' do
    it 'returns true when enabled subscriptions exist' do
      create(:webhook_subscription, enabled: true)
      expect(described_class.any_enabled?).to be true
    end

    it 'returns false when no enabled subscriptions exist' do
      create(:webhook_subscription, :disabled)
      expect(described_class.any_enabled?).to be false
    end
  end
end
