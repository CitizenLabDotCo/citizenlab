class StatCommentPolicy < ApplicationPolicy

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

  def ideas_by_time_cumulative?
    user&.active? && user.admin?
  end

  def comments_count?
    user&.active? && user.admin?
  end

  def comments_by_time?
    user&.active? && user.admin?
  end

  def comments_by_time_cumulative?
    user&.active? && user.admin?
  end

  def comments_by_topic?
    user&.active? && user.admin?
  end

  def comments_by_project?
    user&.active? && user.admin?
  end

end
