# frozen_string_literal: true

# == Schema Information
#
# Table name: sms_deliveries
#
#  id            :uuid             not null, primary key
#  user_id       :uuid
#  phone_number  :string           not null
#  body          :text             not null
#  message_sid   :string
#  status        :string           not null
#  error_message :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  source_type   :string
#  source_id     :uuid
#
# Indexes
#
#  index_sms_deliveries_on_source   (source_type,source_id)
#  index_sms_deliveries_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
module Sms
  class Delivery < ApplicationRecord
    self.table_name = 'sms_deliveries'

    # The statuses order matters for advance_status!
    STATUSES = %w[pending queued sent delivered undelivered failed].freeze

    # A message reaches exactly one terminal outcome. Once there, no later
    # callback may move it (e.g. a stray `failed` must not overwrite `delivered`).
    TERMINAL_STATUSES = %w[delivered undelivered failed].freeze

    belongs_to :user, optional: true
    # Optional originating record (e.g. an SMS campaign). Transactional sends such
    # as OTP leave this nil.
    belongs_to :source, polymorphic: true, optional: true

    validates :phone_number, presence: true
    validates :body, presence: true
    validates :status, inclusion: { in: STATUSES }

    # Tallies deliveries by status for a given source (e.g. an SMS campaign),
    # mirroring EmailCampaigns::Delivery.status_counts.
    def self.status_counts(source)
      where(source: source).group(:status).count
    end

    # Moves the delivery to `new_status` only when that represents forward
    # progress, so out-of-order provider callbacks (Twilio warns these can arrive
    # in any order) never regress it. A delivery already in a terminal status is
    # frozen there. Persists the change.
    # @return [Boolean] whether the status actually advanced
    def advance_status!(new_status)
      raise ArgumentError, "unknown status: #{new_status.inspect}" unless STATUSES.include?(new_status)
      return false if TERMINAL_STATUSES.include?(status)
      return false if STATUSES.index(new_status) <= STATUSES.index(status)

      update!(status: new_status)
      true
    end
  end
end
