class PermissionsService

  ACTIONS = {
    'information' => %w(),
    'ideation' => %w(posting_idea voting_idea commenting_idea),
    'survey' => %w(taking_survey),
    'poll' => %w(taking_poll),
    'budgeting' => %w(commenting_idea budgeting),
    'volunteering' => %w(),
    nil => %w(posting_initiative voting_initiative commenting_initiative)
  }

  POSTING_DISABLED_REASONS = {
    not_permitted: 'not_permitted',
    not_signed_in: 'not_signed_in',
    not_verified: 'not_verified'
  }

  COMMENTING_DISABLED_REASONS = {
    not_permitted: 'not_permitted',
    not_signed_in: 'not_signed_in',
    not_verified: 'not_verified'
  }

  VOTING_DISABLED_REASONS = {
    not_permitted: 'not_permitted',
    not_signed_in: 'not_signed_in',
    not_verified: 'not_verified'
  }


  def initialize
    @verification_service = Verification::VerificationService.new
  end

  def update_global_permissions
    actions = ACTIONS[nil]
    Permission.where(permission_scope: nil).where.not(action: actions).each(&:destroy!)
    actions&.select do |action|
      !Permission.where(permission_scope: nil).find_by action: action
    end.map do |action|
      Permission.create! action: action
    end
  end

  def update_permissions_for_context participation_context
    if participation_context.participation_context?
      actions = ACTIONS[participation_context.participation_method]
      participation_context.permissions.where.not(action: actions).each(&:destroy!)
      actions&.select do |action|
        !participation_context.permissions.find_by action: action
      end.map do |action|
        participation_context.permissions.create! action: action
      end
    end
  end

  def update_all_permissions
    PermissionsService.new.update_global_permissions
    Project.all.each do |project|
      PermissionsService.new.update_permissions_for_context project
      project.phases.each do |phase|
        PermissionsService.new.update_permissions_for_context phase
      end
    end
    Permission.all.each do |permission|
      permission.destroy! if !permission.valid?
    end
  end

  def posting_initiative_disabled_reason user
    if !(permission = global_permission('posting_initiative'))&.granted_to?(user)
      if requires_verification?(permission) && !user&.verified
        POSTING_DISABLED_REASONS[:not_verified]
      elsif not_signed_in? user, permission
        POSTING_DISABLED_REASONS[:not_signed_in]
      else
        POSTING_DISABLED_REASONS[:not_permitted]
      end
    else
      nil
    end
  end

  def commenting_initiative_disabled_reason user
    if !(permission = global_permission('commenting_initiative'))&.granted_to?(user)
      if requires_verification?(permission) && !user&.verified
        COMMENTING_DISABLED_REASONS[:not_verified]
      elsif not_signed_in? user, permission
        COMMENTING_DISABLED_REASONS[:not_signed_in]
      else
        COMMENTING_DISABLED_REASONS[:not_permitted]
      end
    else
      nil
    end
  end

  def voting_initiative_disabled_reason user
    if !(permission = global_permission('voting_initiative'))&.granted_to?(user)
      if requires_verification?(permission) && !user&.verified
        VOTING_DISABLED_REASONS[:not_verified]
      elsif not_signed_in? user, permission
        VOTING_DISABLED_REASONS[:not_signed_in]
      else
        VOTING_DISABLED_REASONS[:not_permitted]
      end
    else
      nil
    end
  end

  def cancelling_votes_disabled_reason_for_initiative user
    if !(permission = global_permission('voting_initiative'))&.granted_to?(user)
      if requires_verification?(permission) && !user&.verified
        VOTING_DISABLED_REASONS[:not_verified]
      elsif not_signed_in? user, permission
        VOTING_DISABLED_REASONS[:not_signed_in]
      else
        VOTING_DISABLED_REASONS[:not_permitted]
      end
    else
      nil
    end
  end

  def voting_disabled_reason_for_initiative_comment user
    commenting_initiative_disabled_reason user
  end


  private

  def global_permission action
    Permission.includes(:groups).find_by(permission_scope: nil, action: action)
  end

  def requires_verification? permission
    permission &&
      permission.permitted_by == 'groups' &&
      @verification_service.find_verification_group(groups_by_permission_id(permission.id))
  end

  def groups_by_permission_id id
    Permission.includes(:groups).find{|permission| permission.id == id}.groups
  end

  def not_signed_in? user, permission
    permission &&
      permission.permitted_by == 'users' &&
      !user
  end

end
