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
#  title_multiloc       :jsonb
#  intro_multiloc       :jsonb
#  button_text_multiloc :jsonb
#  context_type         :string
#  deleted_at           :datetime
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id   (author_id)
#  index_email_campaigns_campaigns_on_context_id  (context_id)
#  index_email_campaigns_campaigns_on_deleted_at  (deleted_at)
#  index_email_campaigns_campaigns_on_type        (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaigns::InviteReceived < Campaign
    include ActivityTriggerable
    include Trackable
    include LifecycleStageRestrictable
    include ContentConfigurable
    include Disableable # This campaign is not actually disableable, but this concern ensures that we are able to see it in the editable campaigns list in the admin panel
    allow_lifecycle_stages except: ['churned']

    filter :check_send_invite_email_toggle
    recipient_filter :filter_recipient

    def mailer_class
      InviteReceivedMailer
    end

    def activity_triggers
      {
        'Invite' => {
          'created' => true,
          'resent' => true
        }
      }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      if activity.item&.invitee_id
        users_scope.where(id: activity.item.invitee_id)
      else
        users_scope.none
      end
    end

    def generate_commands(recipient:, activity:)
      [{
        event_payload: {
          inviter_first_name: activity.item.inviter&.first_name,
          inviter_last_name: activity.item.inviter&.last_name,
          invitee_first_name: activity.item.invitee.first_name,
          invitee_last_name: activity.item.invitee.last_name,
          invite_text: format_invite_text(activity.item),
          activate_invite_url: Frontend::UrlService.new.invite_url(activity.item.token, locale: Locale.new(activity.item.invitee.locale))
        }
      }]
    end

    def check_send_invite_email_toggle(activity:, time: nil)
      !!activity.item&.send_invite_email
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.user_who_was_invited'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.user_is_invited_to_platform'
    end

    def can_be_disabled?
      false
    end

    private

    def format_invite_text(invite)
      return unless invite.invite_text

      html = TextImageService.new.render_data_images(invite.invite_text, field: :invite_text, imageable: invite)
      fix_image_widths(html)
    end

    # NOTE: Copied from EmailCampaigns::EditableWithPreview
    def fix_image_widths(html)
      doc = Nokogiri::HTML.fragment(html)
      doc.css('img').each do |img|
        # Set the width to 100% if it's not set.
        # Otherwise, the image will be displayed at its original size.
        # This can mess up the layout if the original image is e.g. 4000px wide.
        img['width'] = '100%' if img['width'].blank?
      end
      doc.to_s
    end
  end
end
