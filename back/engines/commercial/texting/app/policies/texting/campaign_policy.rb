class Texting::CampaignPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.active? && user&.admin?
        scope.all
      else
        scope.none
      end
    end
  end

  def create?
    can_access_and_modify?
  end

  def update?
    can_access_and_modify?
  end

  def destroy?
    can_access_and_modify?
  end

  private

  def can_access_and_modify?
    user&.active? && user&.admin?
  end
end
