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
    class BinnedDistribution < RefDistribution
      validate :validate_distribution

      private

      def self.distribution_schema
        @distribution_schema ||= UserCustomFields::Engine.root.join(
          'config', 'schemas', 'binned_distribution.schema.json'
        ).to_s
      end

      def bin_boundaries
        distribution['bins']
      end

      def counts
        distribution['counts']
      end

      def validate_distribution
        return if custom_field.blank? || distribution.blank?

        errors.add(:distribution, <<~MSG.squish) if bin_boundaries[1..-2].include?(nil)
          bins are not properly defined. Only the first and last bins can be
          open-ended.
        MSG

        errors.add(:distribution, <<~MSG.squish) unless bin_boundaries.compact.sorted?
          bins are not properly defined. The bin boundaries must be sorted.
        MSG

        errors.add(:distribution, <<~MSG.squish) if bin_boundaries.size != counts.size + 1
          bins are not properly defined. The number of bins must match the number of 
          counts.
        MSG
      end

      def validate_custom_field_type
        super

        errors.add(:custom_field, <<-MSG) unless custom_field.input_type == 'number'
          input type must be 'number' for binned distributions.
        MSG

        errors.add(:custom_field, <<-MSG) unless custom_field.key == 'birthyear'
          key must be 'birthyear' for binned distributions.
        MSG
      end
    end
  end
end
