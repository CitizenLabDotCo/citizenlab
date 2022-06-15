# frozen_string_literal: true

module UserCustomFields
  class UsersFinder
    # @param user_scope [ActiveRecord::Relation] the scope of users to filter
    # @param params [Hash]
    # @option params [String] :group group identifier, only users from this group will
    #   be returned
    # @option params [String] :project project identifier, only participants of this
    #   project will be returned
    # @option params [Range] :registration_date_range date range, only users who
    #   completed registration in this range will be returned
    # @return [ActiveRecord::Relation]
    def initialize(user_scope = User, params = {})
      @user_scope = user_scope
      @params = params
    end

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
