# frozen_string_literal: true

# == Schema Information
#
# Table name: webhooks_deliveries
#
#  id                       :uuid             not null, primary key
#  webhooks_subscription_id :uuid             not null
#  activity_id              :uuid             not null
#  event_type               :string           not null
#  status                   :string           default("pending"), not null
#  attempts                 :integer          default(0), not null
#  response_code            :integer
#  response_body            :text
#  error_message            :text
#  last_attempt_at          :datetime
#  succeeded_at             :datetime
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#
# Indexes
#
#  idx_on_webhooks_subscription_id_status_c35145e2df      (webhooks_subscription_id,status)
#  index_webhooks_deliveries_on_activity_id               (activity_id)
#  index_webhooks_deliveries_on_created_at                (created_at)
#  index_webhooks_deliveries_on_status_and_created_at     (status,created_at)
#  index_webhooks_deliveries_on_webhooks_subscription_id  (webhooks_subscription_id)
#
# Foreign Keys
#
#  fk_rails_...  (activity_id => activities.id) ON DELETE => cascade
#  fk_rails_...  (webhooks_subscription_id => webhooks_subscriptions.id) ON DELETE => cascade
#
module Webhooks
  class Delivery < ApplicationRecord
    self.table_name = 'webhooks_deliveries'

    belongs_to :subscription,
      class_name: 'Webhooks::Subscription',
      foreign_key: :webhooks_subscription_id
    belongs_to :activity, class_name: 'Activity'

    STATUSES = %w[pending success failed].freeze

    validates :status, inclusion: { in: STATUSES }
    validates :event_type, presence: true

    scope :pending, -> { where(status: 'pending') }
    scope :succeeded, -> { where(status: 'success') }
    scope :failed, -> { where(status: 'failed') }
    scope :recent, -> { order(created_at: :desc) }
    scope :older_than, ->(date) { where(created_at: ...date) }
  end
end
