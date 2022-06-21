# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class RScoreSerializer < ::WebApi::V1::BaseSerializer
        set_type :representativeness_score

        attribute :score, &:value
        attribute :counts, &:user_counts

        has_one(
          :reference_distribution,
          serializer: UserCustomFields::WebApi::V1::RefDistributionSerializer
        ) { |rscore, _params| rscore.ref_distribution }
      end
    end
  end
end
