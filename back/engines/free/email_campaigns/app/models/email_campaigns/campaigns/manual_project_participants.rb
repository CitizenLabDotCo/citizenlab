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
  class Campaigns::ManualProjectParticipants < Campaigns::Manual
    belongs_to :project, optional: false, foreign_key: :resource_id, class_name: 'Project'

    validates :resource_id, presence: true

    recipient_filter :project_participants

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.project_participants'
    end

    protected

    def skip_resource_absence?
      true
    end

    private

    def project_participants(_users_scope, _options = {})
      ParticipantsService.new.project_participants(project)
    end
  end
end
