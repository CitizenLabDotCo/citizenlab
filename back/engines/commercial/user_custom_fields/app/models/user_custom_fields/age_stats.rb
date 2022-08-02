# frozen_string_literal: true

module UserCustomFields
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

    def population_counts
      reference_distribution&.counts
    end

    def expected_binned_counts
      @expected_binned_counts ||= begin
        nb_users_with_age = counter_result.binned_counts.sum
        reference_distribution&.expected_counts(nb_users_with_age)
      end
    end
  end
end
