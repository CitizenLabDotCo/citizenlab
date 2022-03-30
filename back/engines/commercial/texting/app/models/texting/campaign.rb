# == Schema Information
#
# Table name: texting_campaigns
#
#  id            :uuid             not null, primary key
#  phone_numbers :string           default([]), not null, is an Array
#  message       :text             not null
#  sent_at       :datetime
#  status        :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

module Texting
  class Campaign < ApplicationRecord
    enum status: {
      draft: 'draft',
      sending: 'sending',
      sent: 'sent'
    }.freeze

    before_validation :format_phone_numbers

    validates :phone_numbers, :message, :status, presence: true
    # https://support.twilio.com/hc/en-us/articles/360033806753-Maximum-Message-Length-with-Twilio-Programmable-Messaging
    validates :message, length: { maximum: 320 }
    validate :validate_phone_numbers

    after_initialize do
      self.status ||= self.class.statuses.fetch(:draft)
    end

    def self.this_month_segments_count
      where.not(status: statuses.fetch(:draft))
           .where('sent_at > ?', Time.zone.now.beginning_of_month).sum(&:segments_count)
    end

    def segments_count
      phone_numbers.count * Sms.segments_count(message)
    end

    private

    # we don't want the same recipient to get 2 messages
    def format_phone_numbers
      self.phone_numbers = phone_numbers.uniq { |number| number.gsub(/[-\s]/, '') }
    end

    def validate_phone_numbers
      return unless phone_numbers_changed?

      codes = AppConfiguration.instance.settings('texting', 'recipient_country_calling_codes')
      invalid_numbers = phone_numbers.reject { |number| Texting::PhoneNumber.valid?(number, codes) }
      errors.add(:phone_numbers, :invalid, invalid_numbers: invalid_numbers) if invalid_numbers.any?
    end
  end
end
