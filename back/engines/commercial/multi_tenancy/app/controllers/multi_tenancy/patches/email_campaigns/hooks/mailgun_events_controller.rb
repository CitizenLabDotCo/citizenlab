# frozen_string_literal: true

module MultiTenancy
  module Patches
    module EmailCampaigns
      module Hooks
        module MailgunEventsController
          def self.included(base)
            base.class_eval do
              around_action :switch_tenant
            end
          end

          def switch_tenant(&block)
            tenant_id = params.dig(:'event-data', :'user-variables', :cl_tenant_id)
            if tenant_id
              Tenant.find(tenant_id).switch(&block)
            else
              head :not_acceptable
            end
          rescue Apartment::TenantNotFound, ActiveRecord::RecordNotFound
            head :not_acceptable
          end
        end
      end
    end
  end
end
