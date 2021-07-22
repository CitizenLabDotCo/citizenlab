class StatVotePolicy < ApplicationPolicy

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      return scope.none unless user&.active?

      resolve_for_active
    end

    private

    def resolve_for_active
      user.admin? ? scope.all : scope.none
    end
  end

  def votes_count?
    show_stats?
  end

  def votes_by_birthyear?
    show_stats?
  end

  def votes_by_domicile?
    show_stats?
  end

  def votes_by_education?
    show_stats?
  end

  def votes_by_gender?
    show_stats?
  end

  def votes_by_custom_field?
    show_stats?
  end

  def votes_by_time?
    show_stats?
  end

  def votes_by_time_cumulative?
    show_stats?
  end

  def votes_by_topic?
    show_stats?
  end

  def votes_by_project?
    show_stats?
  end

  def votes_by_birthyear_as_xlsx?
    show_stats?
  end

  def votes_by_domicile_as_xlsx?
    show_stats?
  end

  def votes_by_education_as_xlsx?
    show_stats?
  end

  def votes_by_gender_as_xlsx?
    show_stats?
  end

  def votes_by_custom_field_as_xlsx?
    show_stats?
  end

  def votes_by_time_as_xlsx?
    show_stats?
  end

  def votes_by_topic_as_xlsx?
    show_stats?
  end

  def votes_by_project_as_xlsx?
    show_stats?
  end

  private

  def show_stats?
    return unless user&.active?

    show_stats_to_active?
  end

  def show_stats_to_active?
    user.admin?
  end
end

StatVotePolicy.prepend_if_ee('ProjectManagement::Patches::StatVotePolicy')
