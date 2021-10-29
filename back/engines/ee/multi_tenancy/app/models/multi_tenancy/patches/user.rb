# frozen_string_literal: true

module MultiTenancy
  module Patches
    module User
      def to_token_payload
        super.merge(cluster: CL2_CLUSTER, tenant: Tenant.current.id)
      end
    end
  end
end
