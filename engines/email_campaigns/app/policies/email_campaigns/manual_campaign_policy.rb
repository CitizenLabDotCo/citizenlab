module EmailCampaigns
  class ManualCampaignPolicy < EmailCampaignsPolicy
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

    def do_send?
      !record.sent? && user&.active? && user.admin?
    end

    def send_preview?
      !record.sent? && user&.active? && user.admin?
    end

    def preview?
      user&.active? && user.admin?
    end

    def recipients?
      user&.active? && user.admin?
    end

    def stats?
      user&.active? && user.admin?
    end

    def destroy?
      update?
    end
  end
end
