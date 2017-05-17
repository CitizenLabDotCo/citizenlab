class StatPolicy < ApplicationPolicy

  def users_by_time?
    user && user.admin?
  end

  def users_by_gender?
    user && user.admin?
  end

  def users_by_birthyear?
    user && user.admin?
  end

  def users_by_domicile?
    user && user.admin?
  end

  def users_by_education?
    user && user.admin?
  end

  def ideas_by_topic?
    user && user.admin?
  end

  def ideas_by_area?
    user && user.admin?
  end

  def ideas_by_project?
    user && user.admin?
  end

  def ideas_by_time?
    user && user.admin?
  end

  def comments_by_time?
    user && user.admin?
  end

  def votes_by_time?
    user && user.admin?
  end
end
