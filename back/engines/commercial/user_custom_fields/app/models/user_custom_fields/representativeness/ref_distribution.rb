# frozen_string_literal: true

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
    class RefDistribution < ApplicationRecord
      attr_readonly :custom_field_id
      attr_readonly :type
      belongs_to :custom_field

      validates :type, presence: true
      validates :distribution, presence: true, json: { schema: -> { self.class.distribution_schema } }
      validates :custom_field_id, uniqueness: true
      validate :validate_distribution_counts
      validate :validate_custom_field_type_with_guard

      class << self
        # This method allows pundit to identify the right policy class for
        # instances of subclasses of this class.
        def policy_class
          ::UserCustomFields::Representativeness::RefDistributionPolicy
        end

        def distribution_schema
          raise NotImplementedError, 'distribution_schema must be overridden in subclasses.'
        end
      end

      private

      def counts
        raise NotImplementedError, 'counts must be overridden in subclasses.'
      end

      def total_population
        @total_population ||= counts.sum
      end

      def validate_distribution_counts
        return if custom_field.blank? || distribution.blank?

        errors.add(:distribution, 'population counts cannot be nil.') if counts.any?(&:nil?)

        counts_without_nil = counts.compact
        errors.add(:distribution, 'population counts must be strictly positive.') unless counts_without_nil.all?(&:positive?)
        errors.add(:distribution, 'population counts must be integers.') unless counts_without_nil.all?(&:integer?)
      end

      # Validates that the type of the custom field is compatible with the distribution.
      # The method uses the template method pattern to make it easier to override in
      # subclasses without repeating the guard clause.
      #
      # Subclasses must override +validate_custom_field_type+ to apply their specific
      # rules.
      def validate_custom_field_type_with_guard
        return if custom_field.blank?

        validate_custom_field_type
      end

      # See +validate_custom_field_type_with_guard+.
      def validate_custom_field_type
        errors.add(:custom_field, <<-MSG) unless custom_field.resource_type == 'User'
          resource type must be 'User'.
        MSG
      end
    end
  end
end
