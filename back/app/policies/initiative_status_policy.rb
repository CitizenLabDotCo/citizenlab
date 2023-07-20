# frozen_string_literal: true

class InitiativeStatusPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      initiatives = InitiativePolicy::Scope.new(user, Initiative).resolve

      if UserRoleService.new.can_moderate_initiatives?(user)
        if Initiative.approval_required?
          scope.all
        else
          approval_initiatives = initiatives.with_status_code(InitiativeStatus::APPROVAL_CODES)

          if approval_initiatives.any?
            scope.all
          else
            scope.where(code: InitiativeStatus::NOT_APPROVAL_CODES)
          end
        end
      else
        codes = InitiativeStatus::NOT_APPROVAL_CODES
        InitiativeStatus::APPROVAL_CODES.each do |code|
          # We want to show only statuses used by the current user's initiatives on the initiatives page
          # http://localhost:3000/en/initiatives
          # If this user doesn't use these statuses, we hide them, as other users' initiatives with this status
          # are hidden for this user anyway.
          codes += [code] if initiatives.with_status_code(code).any?
        end
        scope.where(code: codes)
      end
    end
  end

  def show?
    true
  end
end
