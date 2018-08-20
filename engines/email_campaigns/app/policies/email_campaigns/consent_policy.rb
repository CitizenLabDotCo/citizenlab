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

    def update?
      user&.active? &&
        user.id == record.user_id &&
        DeliveryService.new.consentable_campaign_types_for(user).include?(record.campaign_type)
    end

  end
end
