module EmailCampaigns
  class CampaignPolicy < EmailCampaignsPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.active? && user&.admin?
          scope.all
        else
          scope.none
        end
      end
    end

    def create?
      user&.active? && user.admin?
    end

    def show?
      user&.active? && user.admin?
    end

    def update?
      !record.sent? && user&.active? && user.admin?
    end

    def send?
      !record.sent? && user&.active? && user.admin?
    end

    def destroy?
      update?
    end
  end
end
