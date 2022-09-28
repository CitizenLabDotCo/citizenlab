# frozen_string_literal: true

class SurveyResponsePolicy < IdeaPolicy
  def show?
    false
  end

  def by_slug?
    false
  end

  def update?
    false
  end

  def destroy?
    false
  end
end
