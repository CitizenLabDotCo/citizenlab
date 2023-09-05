# frozen_string_literal: true

class InitiativeStatusPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      filter_out_review_statuses
    end

    private

    # This method handles the case when review was turned on,
    # some initiatives were created, and then review was turned off.
    # We still want to show statuses of all used initiatives after that.
    def filter_out_review_statuses
      if UserRoleService.new.can_moderate_initiatives?(user)
        if Initiative.review_required?
          scope.all
        else
          review_initiatives = initiatives.with_status_code(InitiativeStatus::REVIEW_CODES)

          if review_initiatives.any?
            scope.all # make it possible to change the status of initiatives that were created when review was on
          else
            scope.where(code: InitiativeStatus::NOT_REVIEW_CODES)
          end
        end
      else
        public_codes = InitiativeStatus::NOT_REVIEW_CODES
        # We want to show only statuses of initiatives available to the current user.
        user_codes = initiatives.joins(:initiative_status).distinct.pluck('initiative_status.code')
        scope.where(code: (public_codes + user_codes).uniq)
      end
    end

    def initiatives
      InitiativePolicy::Scope.new(user, Initiative).resolve
    end
  end

  def show?
    true
  end
end
