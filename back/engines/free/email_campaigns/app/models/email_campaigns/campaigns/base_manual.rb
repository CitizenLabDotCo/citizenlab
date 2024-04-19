# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id               :uuid             not null, primary key
#  type             :string           not null
#  author_id        :uuid
#  enabled          :boolean
#  sender           :string
#  reply_to         :string
#  schedule         :jsonb
#  subject_multiloc :jsonb
#  body_multiloc    :jsonb
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  deliveries_count :integer          default(0), not null
#  context_id       :string
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

    def run_before_send_hooks(activity: nil, time: nil)
      result = true
      current_class = self.class

      while current_class <= ::EmailCampaigns::Campaign
        result &&= current_class.before_send_hooks.all? do |action_symbol|
          send(action_symbol, activity: activity, time: time)
        end

        current_class = current_class.superclass
      end

      result
    end

    def run_after_send_hooks(command)
      result = true
      current_class = self.class

      while current_class <= ::EmailCampaigns::Campaign
        result &&= current_class.after_send_hooks.all? do |action_symbol|
          send(action_symbol, command)
        end
        current_class = current_class.superclass
      end

      result
    end

    def apply_recipient_filters(activity: nil, time: nil)
      current_class = self.class

      users_scope = User.where.not(email: nil)
      while current_class <= ::EmailCampaigns::Campaign
        users_scope = current_class.recipient_filters.inject(users_scope) do |users_scope, action_symbol|
          send(action_symbol, users_scope, activity: activity, time: time)
        end

        current_class = current_class.superclass
      end

      users_scope
    end

    private

    def only_manual_send(activity: nil, time: nil)
      !activity && !time
    end
  end
end
