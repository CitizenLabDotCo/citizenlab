require 'rubyXL'

class PermissionsService

  INFORMATION_ACTIONS = %w()
  IDEATION_ACTIONS = %w(posting)
  SURVEY_ACTIONS = %w()


  def create_permissions_for participation_context
    if !participation_context.is_timeline_project?
      actions = "#{participation_context.participation_method.upcase}_ACTIONS".constantize
      actions.select do |action|
        !permissions.find_by action: action
      end.each do |action|
        permissions.create! action: action
      end
    end
  end


  private

  def prrt
    puts 'prrt'
  end

end