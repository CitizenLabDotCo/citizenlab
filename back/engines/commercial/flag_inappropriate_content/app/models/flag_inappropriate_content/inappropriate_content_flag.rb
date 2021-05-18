module FlagInappropriateContent
  class InappropriateContentFlag < ApplicationRecord
    belongs_to :flaggable, polymorphic: true

    validates :flaggable, presence: true


    def reason_code
      return 'inappropriate' if toxicity_label
      spam_reasons = flaggable.spam_reports.pluck :reason_code
      spam_reasons.delete 'other'
      return 'inappropriate' if spam_reasons.empty?
      spam_reasons.max_by do |reason| 
        spam_reasons.count reason
      end
    end
     
  end
end
