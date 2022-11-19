# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class AgeStatsSerializer < ActiveModel::Serializer
        attribute :user_count, key: :total_user_count
        attribute :unknown_age_count

        attribute :series do
          {
            user_counts: object.binned_counts,
            expected_user_counts: object.expected_binned_counts,
            reference_population: object.population_counts,
            bins: object.bins
          }
        end
      end
    end
  end
end
