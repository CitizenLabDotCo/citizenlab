# frozen_string_literal: true

# == Schema Information
#
# Table name: flag_inappropriate_content_inappropriate_content_flags
#
#  id             :uuid             not null, primary key
#  flaggable_id   :uuid             not null
#  flaggable_type :string           not null
#  deleted_at     :datetime
#  toxicity_label :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  inappropriate_content_flags_flaggable  (flaggable_id,flaggable_type)
#
module FlagInappropriateContent
  class InappropriateContentFlag < ApplicationRecord
    TOXICITY_LABELS = %w[insult harmful sexually_explicit spam].freeze

    belongs_to :flaggable, polymorphic: true

    before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
    has_many :notifications, dependent: :nullify

    validates :flaggable, presence: true
    validates :toxicity_label, inclusion: { in: TOXICITY_LABELS }, allow_nil: true

    def deleted?
      !!deleted_at
    end

    # We use `toxicity_label` as a proxy to determine whether the flag was automatically
    # detected as it's currently only set when using NLP detection.
    def automatically_detected?
      toxicity_label.present?
    end

    def reason_code
      return 'inappropriate' if toxicity_label

      spam_reasons = flaggable.spam_reports.pluck :reason_code
      spam_reasons.delete 'other'
      return 'inappropriate' if spam_reasons.empty?

      # return most frequent reason
      spam_reasons.max_by do |reason|
        spam_reasons.count reason
      end
    end

    def project_id
      flaggable.try(:project_id)
    end

    private

    def remove_notifications
      notifications.each do |notification|
        if !notification.update inappropriate_content_flag: nil
          notification.destroy!
        end
      end
    end
  end
end
