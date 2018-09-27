require 'rubyXL'

class PermissionsService

  INFORMATION_ACTIONS = %w()
  IDEATION_ACTIONS = %w(posting voting commenting)
  SURVEY_ACTIONS = %w()


  def update_permissions_for participation_context
    if participation_context.is_participation_context?
      actions = "#{self.class.name}::#{participation_context.participation_method.upcase}_ACTIONS".constantize
      participation_context.permissions.where.not(action: actions).each(&:destroy!)
      actions.select do |action|
        !participation_context.permissions.find_by action: action
      end.map do |action|
        participation_context.permissions.create! action: action
      end
    end
  end


  private

end