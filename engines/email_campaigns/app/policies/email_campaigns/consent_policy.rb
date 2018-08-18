module EmailCampaigns
  class ConsentPolicy < EmailCampaignsPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        scope.where(user_id: user.id)
      end
    end

    def update?
      user&.active? && user.id == record.user_id
    end

  end
end
