class PermissionsService

  ACTIONS = {
    'information' => %w(),
    'ideation' => %w(posting voting commenting),
    'survey' => %w(taking_survey),
    'poll' => %w(taking_poll),
    'budgeting' => %w(commenting budgeting),
    'volunteering' => %w()
  }


  def update_permissions_for participation_context
    if participation_context.is_participation_context?
      actions = ACTIONS[participation_context.participation_method]
      participation_context.permissions.where.not(action: actions).each(&:destroy!)
      actions.select do |action|
        !participation_context.permissions.find_by action: action
      end.map do |action|
        participation_context.permissions.create! action: action, permitted_by: 'everyone'
      end
    end
  end

  def update_permissions_for_current_tenant
    Project.all.each do |project|
      PermissionsService.new.update_permissions_for project
      project.phases.each do |phase|
        PermissionsService.new.update_permissions_for phase
      end
    end
    Permission.all.each do |permission|
      permission.destroy! if !permission.valid?
    end
  end

end