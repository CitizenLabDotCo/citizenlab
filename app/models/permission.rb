class Permission < ApplicationRecord
	ACTIONS = %w(posting_idea voting_idea commenting_idea posting_initiative voting_initiative commenting_initiative budgeting taking_survey taking_poll)
	PERMITTED_BIES = %w(everyone users groups admins_moderators)

  belongs_to :permission_scope, polymorphic: true, optional: true
	has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions

  validates :action, presence: true, inclusion: {in: ACTIONS}
  validates :permitted_by, presence: true, inclusion: {in: PERMITTED_BIES}
  validates :action, uniqueness: {scope: [:permission_scope_id, :permission_scope_type]}

  before_validation :set_permitted_by, on: :create


  scope :for_user, -> (user) {
    if user&.admin? 
      all
    elsif user
      permissions_for_everyone_ids = where(permitted_by: ['everyone', 'users']).ids
      moderating_context_ids = ParticipationContextService.new.moderating_participation_context_ids(user)
      moderating_permissions_ids = where(permission_scope_id: moderating_context_ids).ids
      group_permission_ids = joins(:groups_permissions)
        .where(permitted_by: 'groups')
        .where(groups_permissions: {group_id: user.group_ids}).ids
      where(id: (permissions_for_everyone_ids + moderating_permissions_ids + group_permission_ids).uniq)
    else
      where(permitted_by: 'everyone')
    end
  }


  def granted_to? user
    project_id = permission_scope&.project&.id
  	case permitted_by
  	when 'everyone'
  		true
    when 'users'
      !!user
  	when 'groups'
  		user && (user.admin_or_moderator?(project_id) || (group_ids & user.group_ids).present?)
  	when 'admins_moderators'
      user&.admin_or_moderator?(project_id)
  	end
  end

  def participation_conditions
    service = SmartGroupsService.new
    groups.select(&:rules?).map do |group|
      group.rules.select do |rule|
        rule['ruleType'] != 'verified'
      end.map do |rule|
        service.parse_json_rule rule
      end.map(&:description_multiloc)
    end.reject { |rules| rules.empty? }
  end


  private

  def set_permitted_by
  	self.permitted_by ||= 'users'
  end

end
