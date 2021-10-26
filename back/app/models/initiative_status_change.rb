# == Schema Information
#
# Table name: initiative_status_changes
#
#  id                   :uuid             not null, primary key
#  user_id              :uuid
#  initiative_id        :uuid
#  initiative_status_id :uuid
#  official_feedback_id :uuid
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_initiative_status_changes_on_initiative_id         (initiative_id)
#  index_initiative_status_changes_on_initiative_status_id  (initiative_status_id)
#  index_initiative_status_changes_on_official_feedback_id  (official_feedback_id)
#  index_initiative_status_changes_on_user_id               (user_id)
#
class InitiativeStatusChange < ApplicationRecord
  belongs_to :initiative_status
  belongs_to :initiative
  belongs_to :official_feedback, optional: true
  belongs_to :user, optional: true

  accepts_nested_attributes_for :official_feedback

  validates :initiative_status, :initiative, presence: true
  validates :created_at, uniqueness: { scope: :initiative_id }
end
