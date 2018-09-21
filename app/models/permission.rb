class Permission < ApplicationRecord
	ACTIONS = %w(posting)
	PERMITTED_BIES = %w(everyone groups admins_moderators)

  belongs_to :participation_context, polimorphic: true
	has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions

  validates :action, :permitted_by, :participation_context, presence: true

end
