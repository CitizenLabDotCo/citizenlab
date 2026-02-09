# frozen_string_literal: true

# == Schema Information
#
# Table name: webhooks_subscriptions
#
#  id           :uuid             not null, primary key
#  name         :string           not null
#  url          :string           not null
#  secret_token :string           not null
#  events       :jsonb            not null
#  project_id   :uuid
#  enabled      :boolean          default(TRUE), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_webhooks_subscriptions_on_enabled     (enabled)
#  index_webhooks_subscriptions_on_events      (events) USING gin
#  index_webhooks_subscriptions_on_project_id  (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id) ON DELETE => cascade
#
module Webhooks
  class Subscription < ApplicationRecord
    self.table_name = 'webhooks_subscriptions'

    belongs_to :project, optional: true
    has_many :deliveries,
      class_name: 'Webhooks::Delivery',
      foreign_key: :webhooks_subscription_id,
      dependent: :destroy

    # Supported event types
    # Keep the documentation at https://github.com/CitizenLabDotCo/documentation/blob/master/docs/guides/reference-webhooks.md#supported-events in sync
    SUPPORTED_EVENTS = [
      'idea.created',
      'idea.published',
      'idea.changed',
      'idea.deleted',
      'user.created',
      'user.changed',
      'user.deleted'
    ].freeze

    validates :name, presence: true
    validates :url, presence: true, webhook_url: true
    validates :events, presence: true
    validates :secret_token, presence: true
    validate :validate_supported_events

    before_validation :generate_secret_token, on: :create

    scope :enabled, -> { where(enabled: true) }
    scope :for_event, lambda { |event_type|
      where('events @> ?', [event_type].to_json)
    }
    scope :for_project, lambda { |project_id|
      where(project_id: [nil, project_id])
    }

    def matches_event?(event_type)
      events.include?(event_type)
    end

    def matches_project?(activity_project_id)
      return true if project_id.nil?
      return true if activity_project_id.nil?

      project_id == activity_project_id
    end

    def self.any_enabled?
      enabled.exists?
    end

    private

    def generate_secret_token
      self.secret_token ||= SecureRandom.base64(32)
    end

    def validate_supported_events
      unsupported = events - SUPPORTED_EVENTS
      if unsupported.any?
        errors.add(:events, "contains unsupported event types: #{unsupported.join(', ')}")
      end
    end
  end
end
