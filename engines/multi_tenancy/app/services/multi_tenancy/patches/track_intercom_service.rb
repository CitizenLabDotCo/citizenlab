# frozen_string_literal: true

module MultiTenancy
  module Patches
    module TrackIntercomService
      # Patches +identify_user+ to link the user with an intercom company
      # (tenant) if possible.
      def identify_user(user)
        contact = super # returns nil if the tracking is off (in general or for that user in particular).
        add_company_to_contact(contact, Tenant.current) if contact
      rescue Intercom::ResourceNotFound
        # Ignored: we don't add the company when there is not current tenant.
      end

      def user_attributes(user)
        super.merge(TrackingTenantService.new.tenant_properties)
      end

      def activity_attributes(activity)
        tracking_service = TrackingTenantService.new
        super.merge(tracking_service.tenant_properties)
             .merge(tracking_service.environment_properties)
      end

      def tenant_attributes(tenant)
        TrackingTenantService.new.tenant_properties(tenant)
      end

      private

      def add_company_to_contact(contact, tenant)
        company = @intercom.companies.find(id: tenant.id)
        contact.add_company(id: company.id)
      rescue Intercom::ResourceNotFound
        # Ignored
      end
    end
  end
end

TrackIntercomService.prepend(MultiTenancy::Patches::TrackIntercomService)
