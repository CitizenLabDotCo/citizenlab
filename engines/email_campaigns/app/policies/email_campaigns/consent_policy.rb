module EmailCampaigns
  class ConsentPolicy < EmailCampaignsPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        consentable_campaign_types = DeliveryService.new.consentable_campaign_types_for(@user)
        scope.where(
          user_id: @user.id, 
          campaign_type: consentable_campaign_types
        )
      end
    end

    def index?
      user&.active?
    end

    def update?
      user&.active? &&
        user.id == record.user_id &&
        DeliveryService.new.consentable_campaign_types_for(user).include?(record.campaign_type)
    end

    def update_by_campaign_id?
      update?
    end

  end
end
