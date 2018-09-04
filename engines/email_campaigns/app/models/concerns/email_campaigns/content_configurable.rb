module EmailCampaigns
  module ContentConfigurable
    extend ActiveSupport::Concern

    MAX_SUBJECT_LEN = 80

    included do
      validates :subject_multiloc, presence: true, multiloc: {presence: true, length: {maximum: MAX_SUBJECT_LEN}}
      validates :body_multiloc, presence: true, multiloc: {presence: true}
    end

  end
end