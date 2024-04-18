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
#  resource_id      :string
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id    (author_id)
#  index_email_campaigns_campaigns_on_resource_id  (resource_id)
#  index_email_campaigns_campaigns_on_type         (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaigns::ManualProjectParticipants < Campaign
    include Consentable
    include ContentConfigurable
    include SenderConfigurable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages except: %w[trial churned]

    belongs_to :project, optional: false, foreign_key: :resource_id, class_name: 'Project'

    validates :resource_id, presence: true

    recipient_filter :project_participants

    # Without this, the campaign would be sent on every event and every schedule trigger
    before_send :only_manual_send

    def mailer_class
      ManualCampaignMailer
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.project_participants'
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

    def manageable_by_project_moderator?
      true
    end

    def manual?
      true
    end

    protected

    def skip_resource_absence?
      true
    end

    private

    def project_participants(users_scope, _options = {})
      users_scope.where(id: ParticipantsService.new.project_participants(project))
    end

    def only_manual_send(activity: nil, time: nil)
      !activity && !time
    end
  end
end
