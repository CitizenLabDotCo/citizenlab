# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class BinnedDistributionSerializer < ::WebApi::V1::BaseSerializer
        set_type :binned_distribution

        attribute :distribution
      end
    end
  end
end
