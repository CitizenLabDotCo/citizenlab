# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class RefDistributionSerializer < ::WebApi::V1::BaseSerializer
        set_type :reference_distribution

        attribute :distribution, &:normalized_distribution

        has_many(
          :values,
          serializer: ::WebApi::V1::CustomFieldOptionSerializer,
          record_type: :custom_field_option
        )
      end
    end
  end
end
