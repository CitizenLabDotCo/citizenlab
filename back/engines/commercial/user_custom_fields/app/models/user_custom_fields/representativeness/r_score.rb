# frozen_string_literal: true

class UserCustomFields::Representativeness::RScore
  attr_reader :value, :user_counts, :ref_distribution

  # @param [Numeric] value
  # @param [UserCustomFields::Representativeness::RefDistribution] ref_distribution
  def initialize(value, user_counts, ref_distribution)
    @value = value
    @user_counts = user_counts
    @ref_distribution = ref_distribution
    @timestamp = Time.zone.now
  end

  def id
    "#{@ref_distribution.id}_#{@timestamp.to_i}_rscore"
  end

  class << self
    # Compute the ratio between the minimum and maximum participation rates.
    # @param [Hash] user_counts
    # @param [Hash] population_counts
    # @return [Numeric]
    def min_max_p_ratio(user_counts, population_counts)
      min_rate, max_rate = participation_rates(user_counts, population_counts).minmax
      min_rate / max_rate
    end

    # Compute the ratio between the minimum and mean participation rates.
    # @param [Hash] user_counts
    # @param [Hash] population_counts
    # @return [Numeric]
    def min_mean_p_ratio(user_counts, population_counts)
      participation_rates = send(:participation_rates, user_counts, population_counts)
      min_rate = participation_rates.min
      mean_rate = participation_rates.sum.to_f / participation_rates.size
      min_rate / mean_rate
    end

    def participation_rates(user_counts, population_counts)
      population_counts.keys.map do |option_id|
        user_counts.fetch(option_id, 0) / population_counts[option_id].to_f
      end
    end

    def proportional_similarity(user_counts, population_counts)
      user_counts = user_counts.slice(*population_counts.keys)
      return Float::NAN if user_counts.values.sum.zero?

      user_distribution = normalize(user_counts)
      population_distribution = normalize(population_counts)

      population_distribution.sum do |option_id, prob|
        [prob, user_distribution.fetch(option_id, 0)].min
      end
    end

    def compute_scores(user_counts, population_counts)
      if user_counts.is_a?(Array) && population_counts.is_a?(Array)
        raise ArgumentError, <<~MSG unless user_counts.size == population_counts.size
          'user_counts' and 'population_counts' must be of the same length when counts 
          are arrays.
        MSG

        # Converting arrays to hashes. The choice of the key is not important as long as
        # they are consistent between the two arrays.
        user_counts = user_counts.index_by.with_index { |_count, i| i }
        population_counts = population_counts.index_by.with_index { |_count, i| i }
      end

      scores = {
        min_max_p_ratio: min_max_p_ratio(user_counts, population_counts),
        min_mean_p_ratio: min_mean_p_ratio(user_counts, population_counts),
        proportional_similarity: proportional_similarity(user_counts, population_counts)
      }

      Rails.logger.info(
        'Computing R-score',
        scores: scores, user_counts: user_counts, population_counts: population_counts
      )

      scores
    end

    private

    def normalize(counts)
      total = counts.values.sum
      counts.transform_values { |count| count.to_f / total }
    end
  end
end
