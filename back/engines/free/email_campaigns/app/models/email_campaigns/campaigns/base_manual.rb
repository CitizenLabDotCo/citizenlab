# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id                   :uuid             not null, primary key
#  type                 :string           not null
#  author_id            :uuid
#  enabled              :boolean
#  sender               :string
#  reply_to             :string
#  schedule             :jsonb
#  subject_multiloc     :jsonb
#  body_multiloc        :jsonb
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  deliveries_count     :integer          default(0), not null
#  context_id           :uuid
#  custom_text_multiloc :jsonb
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id   (author_id)
#  index_email_campaigns_campaigns_on_context_id  (context_id)
#  index_email_campaigns_campaigns_on_type        (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaigns::BaseManual < Campaign
    include Consentable
    include ContentConfigurable
    include SenderConfigurable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable

    # Without this, the campaign would be sent on every event and every schedule trigger
    before_send :only_manual_send

    def mailer_class
      ManualCampaignMailer
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def generate_commands(recipient:, time: nil, activity: nil)
      [{
        author: author,
        event_payload: {},
        subject_multiloc: subject_multiloc,
        body_multiloc: TextImageService.new.render_data_images_multiloc(body_multiloc, field: :body_multiloc, imageable: self),
        sender: sender,
        reply_to: reply_to
      }]
    end

    def manual?
      true
    end

    private

    def only_manual_send(activity: nil, time: nil)
      !activity && !time
    end
  end
end
