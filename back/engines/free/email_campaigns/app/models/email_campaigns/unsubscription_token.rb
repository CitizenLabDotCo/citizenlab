# == Schema Information
#
# Table name: email_campaigns_unsubscription_tokens
#
#  id      :uuid             not null, primary key
#  token   :string           not null
#  user_id :uuid             not null
#
# Indexes
#
#  index_email_campaigns_unsubscription_tokens_on_token    (token)
#  index_email_campaigns_unsubscription_tokens_on_user_id  (user_id)
#
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
