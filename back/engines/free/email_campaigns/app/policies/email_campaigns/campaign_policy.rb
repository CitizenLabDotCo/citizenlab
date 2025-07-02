# frozen_string_literal: true

module EmailCampaigns
  class CampaignPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      attr_reader :campaign_context

      def initialize(user_context, scope, campaign_context = nil)
        super(user_context, scope)
        @campaign_context = campaign_context
      end

      def resolve
        if user&.active? && UserRoleService.new.can_moderate?(campaign_context, user)
          scope.where(context: campaign_context)
        else
          scope.none
        end
      end
    end

    def create?
      can_access_and_modify?
    end

    def show?
      can_access_and_modify?
    end

    def update?
      return false if record.manual? && record.respond_to?(:sent?) && record.sent?

      can_access_and_modify?
    end

    def do_send?
      update?
    end

    def send_preview?
      update?
    end

    def preview?
      show?
    end

    def deliveries?
      show?
    end

    def stats?
      show?
    end

    def destroy?
      update?
    end

    private

    def can_access_and_modify?
      user&.active? && UserRoleService.new.can_moderate?(record.context, user)
    end
  end
end
