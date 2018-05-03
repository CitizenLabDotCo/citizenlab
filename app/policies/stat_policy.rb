class StatPolicy < ApplicationPolicy

  def users_count?
    user&.active? && user.admin?
  end
  
  def users_by_time?
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

  def ideas_count?
    user&.active? && user.admin?
  end

  def ideas_by_topic?
    user&.active? && user.admin?
  end

  def ideas_by_area?
    user&.active? && user.admin?
  end

  def ideas_by_project?
    user&.active? && user.admin?
  end

  def ideas_by_time?
    user&.active? && user.admin?
  end

  def comments_count?
    user&.active? && user.admin?
  end

  def comments_by_time?
    user&.active? && user.admin?
  end

  def votes_count?
    user&.active? && user.admin?
  end

  def votes_by_time?
    user&.active? && user.admin?
  end
end
