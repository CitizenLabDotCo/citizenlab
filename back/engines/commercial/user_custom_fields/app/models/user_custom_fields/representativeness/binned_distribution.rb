# frozen_string_literal: true

require 'user_custom_fields/core_ext/enumerable'

# == Schema Information
#
# Table name: user_custom_fields_representativeness_ref_distributions
#
#  id              :uuid             not null, primary key
#  custom_field_id :uuid             not null
#  distribution    :jsonb            not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  type            :string
#
# Indexes
#
#  index_ucf_representativeness_ref_distributions_on_custom_field  (custom_field_id)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id)
#
module UserCustomFields
  module Representativeness
    # Currently, the +BinnedDistribution+s can only be used for the birthyear custom field, but this
    # could be adapted to support number custom field in general.
    class BinnedDistribution < RefDistribution
      validate :validate_distribution

      def self.distribution_schema
        @distribution_schema ||= UserCustomFields::Engine.root.join(
          'config', 'schemas', 'binned_distribution.schema.json'
        ).to_s
      end

      def bin_boundaries
        @bin_boundaries ||= distribution['bins'].freeze
      end

      def counts
        @counts ||= distribution['counts'].freeze
      end

      # Returns the expected count distribution for a given (total) number of users.
      # @return [Array<Numeric>]
      def expected_counts(nb_users)
        counts.map { |count| (count.to_f * nb_users / total_population).round(1) }
      end

      def compute_rscore(users)
        user_counts = AgeStats.calculate(users).binned_counts
        score_value = RScore.compute_scores(user_counts, counts)[:min_max_p_ratio]
        RScore.new(score_value, user_counts, self)
      end

      private

      def validate_distribution
        return if custom_field.blank? || distribution.blank?

        errors.add(:distribution, <<~MSG.squish) if bin_boundaries[1..-2].include?(nil)
          bins are not properly defined. Only the first and last bins can be
          open-ended.
        MSG

        errors.add(:distribution, <<~MSG.squish) unless bin_boundaries.compact.sorted?
          bins are not properly defined. The bin boundaries must be sorted.
        MSG

        distinct_bin_boundaries = bin_boundaries.compact.uniq.size == bin_boundaries.compact.size
        errors.add(:distribution, <<~MSG.squish) unless distinct_bin_boundaries
          bins are not properly defined. The bin boundaries must be distinct.
        MSG

        errors.add(:distribution, <<~MSG.squish) if bin_boundaries.size != counts.size + 1
          bins are not properly defined. The number of bins must match the number of 
          counts.
        MSG
      end

      def validate_custom_field_type
        super

        errors.add(:custom_field, <<~MSG.squish) unless custom_field.input_type == 'number'
          input type must be 'number' for binned distributions.
        MSG

        errors.add(:custom_field, <<~MSG.squish) unless custom_field.key == 'birthyear'
          key must be 'birthyear' for binned distributions.
        MSG
      end
    end
  end
end
