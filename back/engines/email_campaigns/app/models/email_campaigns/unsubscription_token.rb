module EmailCampaigns
  class UnsubscriptionToken < ApplicationRecord

    belongs_to :user

    validates :token, presence: true
    before_validation :set_token

    private

    def set_token
      self.token ||= SecureRandom.alphanumeric(64)
    end
  end
end
