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
    if participation_context.is_participation_context?
      actions = ACTIONS[participation_context.participation_method]
      participation_context.permissions.where.not(action: actions).each(&:destroy!)
      actions&.select do |action|
        !participation_context.permissions.find_by action: action
      end.map do |action|
        participation_context.permissions.create! action: action
      end
    end
  end

  def update_permissions_for_current_tenant
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
    if !(permission = context_permission(context, 'posting_initiative'))&.granted_to?(user)
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

end