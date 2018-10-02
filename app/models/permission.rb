class Permission < ApplicationRecord
	ACTIONS = %w(posting voting commenting budgeting taking_survey)
	PERMITTED_BIES = %w(everyone groups admins_moderators)

  belongs_to :permittable, polymorphic: true
	has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions

  validates :permittable, presence: true
  validates :action, presence: true, inclusion: {in: ACTIONS}
  validates :permitted_by, presence: true, inclusion: {in: PERMITTED_BIES}
  validates :action, uniqueness: {scope: [:permittable_id, :permittable_type]}

  before_validation :set_permitted_by, on: :create


  scope :for_user, -> (user) {
    if user&.admin? 
      all
    elsif user
      permissions_for_everyone_ids = where(permitted_by: 'everyone').ids
      moderating_context_ids = ParticipationContextService.new.moderating_participation_context_ids(user)
      moderating_permissions_ids = where(permittable_id: moderating_context_ids).ids
      group_permission_ids = joins(:groups_permissions)
        .where(permitted_by: 'groups')
        .where('groups_permissions.group_id = ?', user.group_ids).ids
      where(id: (permissions_for_everyone_ids + moderating_permissions_ids + group_permission_ids).uniq)
    else
      where(permitted_by: 'everyone')
    end
  }


  def granted_to? user
  	case permitted_by
  	when 'everyone'
  		true
  	when 'groups'
  		(group_ids & user.group_ids).present?
  	when 'admins_moderators'
  		user.admin? || user.project_moderator?(permittable.project.id)
  	end
  end

  def groups_inclusion user
    group_ids = user.group_ids
    groups.map do |group|
      rules = group.rules.map do |rule|
        {
          rule: rule,
          inclusion: SmartGroupsService.new.parse_json_rule(rule).filter(User.where(id: user.id)).exists?
        }
      end
      {
        id: group.id,
        title_multiloc: group.title_multiloc,
        membership_type: group.membership_type,
        inclusion: group_ids.include?(group.id),
        rules: rules
      }
    end
  end


  private

  def set_permitted_by
  	self.permitted_by ||= 'everyone'
  end

end
