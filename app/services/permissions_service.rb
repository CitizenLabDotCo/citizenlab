require 'rubyXL'

class PermissionsService

  INFORMATION_ACTIONS = %w()
  IDEATION_ACTIONS = %w(posting voting commenting)
  SURVEY_ACTIONS = %w(taking_survey)


  def update_permissions_for participation_context
    if participation_context.is_participation_context?
      actions = "#{self.class.name}::#{participation_context.participation_method.upcase}_ACTIONS".constantize
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


  private

end