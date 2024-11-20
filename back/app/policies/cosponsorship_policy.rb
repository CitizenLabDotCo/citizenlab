# frozen_string_literal: true

class CosponsorshipPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(idea_id: scope_for(Idea))
    end
  end

  def accept?
    user.id == record.user_id
  end
end
