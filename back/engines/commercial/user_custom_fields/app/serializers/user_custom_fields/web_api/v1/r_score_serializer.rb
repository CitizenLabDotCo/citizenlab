# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class RScoreSerializer < ::WebApi::V1::BaseSerializer
        set_type :rscore

        attribute :score, &:value
        attribute :counts, &:user_counts

        has_one(
          :reference_distribution,
          polymorphic: true
        ) { |rscore, _params| rscore.ref_distribution }
      end
    end
  end
end
