class InitiativeStatusChange < ApplicationRecord
  belongs_to :initiative_status
  belongs_to :initiative
  belongs_to :official_feedback, optional: true
  belongs_to :user, optional: true

  accepts_nested_attributes_for :official_feedback

  validates :initiative_status, :initiative, presence: true
  validates :created_at, uniqueness: { scope: :initiative_id }
end
