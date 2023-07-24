# frozen_string_literal: true

class InitiativeStatusPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      filter_out_approval_statuses
    end

    private

    # This method handles the case when approval was turned on,
    # some initiatives were created, and then approval was turned off.
    # We still want to show statuses of all initiatives after that.
    def filter_out_approval_statuses
      initiatives = InitiativePolicy::Scope.new(user, Initiative).resolve

      if UserRoleService.new.can_moderate_initiatives?(user)
        if Initiative.approval_required?
          scope.all
        else
          approval_initiatives = initiatives.with_status_code(InitiativeStatus::APPROVAL_CODES)

          if approval_initiatives.any?
            scope.all # make it possible to change the status of initiatives that were created when approval was on
          else
            scope.where(code: InitiativeStatus::NOT_APPROVAL_CODES)
          end
        end
      else
        codes = InitiativeStatus::NOT_APPROVAL_CODES
        # We want to show only statuses of initiatives available to the current user.
        user_codes = initiatives.joins(:initiative_status).distinct.pluck('initiative_statuses.code')
        scope.where(code: (codes + user_codes).uniq)
      end
    end
  end

  def show?
    true
  end
end
