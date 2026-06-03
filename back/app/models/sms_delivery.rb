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
#
# Indexes
#
#  index_sms_deliveries_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class SmsDelivery < ApplicationRecord
  # queued/sent are set when we hand the message to the provider; delivered,
  # undelivered and failed are reached asynchronously via provider callbacks.
  # Order is significant: it defines lifecycle progression so we can keep status
  # advancement monotonic (see #advance_status!). queued/sent come first; the
  # three terminal outcomes follow (a message reaches exactly one of them, so
  # their order relative to each other is irrelevant).
  STATUSES = %w[queued sent delivered undelivered failed].freeze

  belongs_to :user, optional: true

  validates :phone_number, presence: true
  validates :body, presence: true
  validates :status, inclusion: { in: STATUSES }

  # Moves the delivery to `new_status` only when that represents forward
  # progress, so out-of-order provider callbacks (Twilio warns these can arrive
  # in any order) never regress it. Persists the change.
  # @return [Boolean] whether the status actually advanced
  def advance_status!(new_status)
    raise ArgumentError, "unknown status: #{new_status.inspect}" unless STATUSES.include?(new_status)
    return false if STATUSES.index(new_status) <= STATUSES.index(status)

    update!(status: new_status)
    true
  end
end
