class StatVotePolicy < ApplicationPolicy

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.active? && user.admin?
        scope.all
      else user&.active? && user.project_moderator?
        projects = ProjectPolicy::Scope.new(user, Project.all).moderatable
        scope
          .where(votable_type: 'Idea')
          .joins("JOIN ideas ON ideas.id = votes.votable_id")
          .where(ideas: {project_id: projects})
      end
    end
  end

  def votes_count?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_birthyear?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_domicile?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_education?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_gender?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_custom_field?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_time?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_time_cumulative?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_topic?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_project?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_birthyear_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_domicile_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_education_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_gender_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_custom_field_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_time_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_time_cumulative_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_topic_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def votes_by_project_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end
end
