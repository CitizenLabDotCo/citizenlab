# frozen_string_literal: true

module UserCustomFields
  class UsersFinder
    # @param user_scope [ActiveRecord::Relation] the scope of users to filter
    # @param params [Hash]
    # @option params [String] :group group identifier, the finder will only return users
    #   who are members of this group
    # @option params [String] :project project identifier, the finder will only return
    #   users who participated in this project
    # @option params [Range] :registration_date_range date range, the finder will only
    #   return users who completed registration within this date range
    def initialize(user_scope = User, params = {})
      @user_scope = user_scope
      @params = params
    end

    # @return [ActiveRecord::Relation]
    def execute
      users = filter_by_registration_date(@user_scope)
      users = filter_by_group(users)
      filter_by_project(users)
    end

    def filter_by_registration_date(users)
      return users unless @params[:registration_date_range]

      users.where(registration_completed_at: @params[:registration_date_range])
    end

    def filter_by_group(users)
      return users unless @params[:group]

      group = Group.find(@params[:group])
      users.merge(group.members)
    end

    def filter_by_project(users)
      return users unless @params[:project]

      project = Project.find(@params[:project])
      participants = ParticipantsService.new.project_participants(project)
      users.where(id: participants)
    end
  end
end
