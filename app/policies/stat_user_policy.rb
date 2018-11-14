class StatUserPolicy < ApplicationPolicy

  def users_count?
    user&.active? && user.admin?
  end
  
  def users_by_time?
    user&.active? && user.admin?
  end

  def users_by_time_cumulative?
    user&.active? && user.admin?
  end

  def active_users_by_time?
    user&.active? && user.admin?
  end

  def users_by_gender?
    user&.active? && user.admin?
  end

  def users_by_birthyear?
    user&.active? && user.admin?
  end

  def users_by_domicile?
    user&.active? && user.admin?
  end

  def users_by_education?
    user&.active? && user.admin?
  end

  def users_by_custom_field?
    user&.active? && user.admin?
  end

  def users_engagement_scores?
    user&.active? && user.admin?
  end

end
