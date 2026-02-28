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
  class Campaigns::ManualProjectParticipants < Campaigns::BaseManual
    allow_lifecycle_stages except: %w[trial churned]

    recipient_filter :project_participants_and_followers

    validates :context, presence: true
    validates :context_type, inclusion: { in: ['Project'] }

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.project_participants'
    end

    def self.supports_context?(context)
      context.is_a?(Project)
    end

    private

    def project_participants_and_followers(users_scope, _options = {})
      users_scope
        .where(id: ParticipantsService.new.projects_participants(context))
        .or(users_scope.where(id: context.followers.pluck(:user_id)))
    end
  end
end
