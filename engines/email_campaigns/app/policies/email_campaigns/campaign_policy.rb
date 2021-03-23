# frozen_string_literal: true

module EmailCampaigns
  class CampaignPolicy < EmailCampaignsPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

      def resolve
        return scope.none unless user&.active?

        resolve_for_active
      end

      def resolve_for_active
        resolve_for_admin
      end

      def resolve_for_admin
        return scope.none unless user.admin?

        scope.all
      end
    end

    def create?
      manual_campaign? && can_access_and_modify?
    end

    def show?
      if manual_campaign?
        can_access_and_modify?
      else
        active? && admin?
      end
    end

    def update?
      if manual_campaign?
        !(record.respond_to?(:sent?) && record.sent?) && can_access_and_modify?
      else
        active? && admin?
      end
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
      active? && active_can_access_and_modify?
    end

    def active_can_access_and_modify?
      admin?
    end

    def manual_campaign?
      record.is_a?(::EmailCampaigns::Campaigns::Manual)
    end
  end
end

EmailCampaigns::CampaignPolicy.prepend_if_ee('ProjectPermissions::Patches::EmailCampaigns::CampaignPolicy')
EmailCampaigns::CampaignPolicy::Scope.prepend_if_ee('ProjectPermissions::Patches::EmailCampaigns::CampaignPolicy::Scope')
