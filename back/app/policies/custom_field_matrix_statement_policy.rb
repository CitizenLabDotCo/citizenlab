class CustomFieldMatrixStatementPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope
    end
  end

  def show?
    true
  end
end
