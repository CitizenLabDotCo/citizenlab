module FlagInappropriateContent
  class InappropriateContentFlag < ApplicationRecord
    belongs_to :flaggable, polymorphic: true

    before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
    has_many :notifications, foreign_key: :inappropriate_content_flag_id, dependent: :nullify

    validates :flaggable, presence: true
    
    
    def deleted?
      !!deleted_at
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
