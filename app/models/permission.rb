class Permission < ApplicationRecord
	ACTIONS = %w(posting)
	PERMITTED_BIES = %w(everyone groups admins_moderators)

  belongs_to :participation_context, polimorphic: true
	has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions

  validates :participation_context, presence: true
  validates :action, presence: true, inclusion: {in: ACTIONS}
  validates :permitted_by, presence: true, inclusion: {in: PERMITTED_BIES}
  validates :action, uniqueness: {scope: [:participation_context_id, :participation_context_type]}

end
