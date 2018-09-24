class Permission < ApplicationRecord
	ACTIONS = %w(posting)
	PERMITTED_BIES = %w(everyone groups admins_moderators)

  belongs_to :permittable, polymorphic: true
	has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions

  validates :permittable, presence: true
  validates :action, presence: true, inclusion: {in: ACTIONS}
  validates :permitted_by, presence: true, inclusion: {in: PERMITTED_BIES}
  validates :action, uniqueness: {scope: [:permittable_id, :permittable_type]}

  after_validation :set_permitted_by


  def granted_to? user
  	(group_ids & user.group_ids).present?
  end


  private

  def set_permitted_by
  	permitted_by ||= 'everyone'
  end

end
