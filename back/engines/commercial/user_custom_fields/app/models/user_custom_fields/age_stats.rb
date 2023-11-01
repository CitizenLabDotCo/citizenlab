# frozen_string_literal: true

module UserCustomFields
  # An +AgeStats+ instance holds various statistics / count data about a set of users.
  #
  # Note:
  # This model is not an ActiveRecord model and is not persisted in the database. It
  # subclasses +ActiveModelSerializers::Model+ to facilitate its use with
  # `active_model_serializers`.
  class AgeStats < ActiveModelSerializers::Model
    attributes :user_count, :reference_distribution, :counter_result

    delegate :binned_counts, :unknown_age_count, :bins, to: :counter_result

    def self.calculate(users)
      reference_distribution = CustomField.find_by(key: 'birthyear').current_ref_distribution

      new(
        user_count: users.count,
        reference_distribution: reference_distribution,
        counter_result: AgeCounter.new.count(users, reference_distribution&.bin_boundaries)
      )
    end

    # The reference population counts.
    # @return [Array<Integer>, nil]
    def population_counts
      reference_distribution&.counts
    end
  end
end
