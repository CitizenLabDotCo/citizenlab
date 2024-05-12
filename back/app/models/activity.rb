# frozen_string_literal: true

# == Schema Information
#
# Table name: activities
#
#  id         :uuid             not null, primary key
#  item_type  :string           not null
#  item_id    :uuid             not null
#  action     :string           not null
#  payload    :jsonb            not null
#  user_id    :uuid
#  acted_at   :datetime         not null
#  created_at :datetime         not null
#  project_id :uuid
#
# Indexes
#
#  index_activities_on_acted_at               (acted_at)
#  index_activities_on_action                 (action)
#  index_activities_on_item_type_and_item_id  (item_type,item_id)
#  index_activities_on_project_id             (project_id)
#  index_activities_on_user_id                (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Activity < ApplicationRecord
  MANAGEMENT_FILTERS = [
    { item_type: 'Project', actions: %w[created changed changed_publication_status deleted published] },
    { item_type: 'Phase', actions: %w[created changed deleted] },
    { item_type: 'EmailCampaigns::Campaigns::Manual', actions: ['sent'] },
    { item_type: 'EmailCampaigns::Campaigns::ManualProjectParticipants', actions: ['sent'] },
    { item_type: 'Idea', actions: %w[changed_status deleted] },
    { item_type: 'User', actions: ['blocked']}
  ].freeze

  belongs_to :user, optional: true
  belongs_to :item, polymorphic: true, optional: true

  validates :action, :item_type, :item_id, presence: true

  scope :for_projects, lambda { |*project_ids|
    where(project_id: project_ids).or(where(item_id: project_ids))
  }
end
