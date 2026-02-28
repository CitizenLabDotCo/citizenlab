# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_examples
#
#  id             :uuid             not null, primary key
#  mail_body_html :string           not null
#  locale         :string           not null
#  subject        :string           not null
#  recipient_id   :uuid
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  campaign_id    :uuid
#  deleted_at     :datetime
#
# Indexes
#
#  index_email_campaigns_examples_on_campaign_id   (campaign_id)
#  index_email_campaigns_examples_on_deleted_at    (deleted_at)
#  index_email_campaigns_examples_on_recipient_id  (recipient_id)
#
# Foreign Keys
#
#  fk_rails_...  (recipient_id => users.id)
#
module EmailCampaigns
  class Example < ApplicationRecord
    acts_as_paranoid
    belongs_to :recipient, class_name: 'User', optional: true
    belongs_to :campaign, class_name: 'EmailCampaigns::Campaign'
  end
end
