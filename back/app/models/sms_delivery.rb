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
  STATUSES = %w[queued sent failed].freeze

  belongs_to :user, optional: true

  validates :phone_number, presence: true
  validates :body, presence: true
  validates :status, inclusion: { in: STATUSES }
end
