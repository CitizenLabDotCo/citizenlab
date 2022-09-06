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
    class CategoricalDistribution < RefDistribution
      has_many :options, through: :custom_field

      # rubocop:disable Rails/I18nLocaleTexts
      validates :distribution, length: { minimum: 2, message: 'must have at least 2 options.' }
      # rubocop:enable Rails/I18nLocaleTexts
      validate :validate_distribution_options

      def probabilities_and_counts
        distribution.merge(probabilities) do |_option_id, count, probability|
          { count: count, probability: probability }
        end
      end

      # Returns the expected count distribution for a given (total) number of users.
      def expected_counts(nb_users)
        probabilities.transform_values { |probability| (probability * nb_users).round(1) }
      end

      def distribution_by_option_key
        @distribution_by_option_key ||= distribution.transform_keys do |option_id|
          option_id_to_key.fetch(option_id)
        end
      end

      # Removes options that no longer exist from the distribution description. If it
      # results in a distribution with less than 2 options, the distribution is destroyed.
      def sync_with_options!
        update!(distribution: distribution.slice(*option_ids))
      rescue ActiveRecord::RecordInvalid => e
        raise unless e.message == 'Validation failed: Distribution must have at least 2 options.'

        destroy!
      end

      def compute_rscore(users)
        user_counts = FieldValueCounter.counts_by_field_option(users, custom_field, by: :option_id)
        score_value = RScore.compute_scores(user_counts, distribution)[:min_max_p_ratio]
        RScore.new(score_value, user_counts, self)
      end

      def self.distribution_schema
        @distribution_schema ||= UserCustomFields::Engine.root.join(
          'config', 'schemas', 'categorical_distribution.schema.json'
        ).to_s
      end

      private

      def counts
        @counts ||= distribution.values
      end

      def probabilities
        distribution.transform_values { |count| count.to_f / total_population }
      end

      def option_id_to_key
        @option_id_to_key ||= custom_field.options.to_h { |option| [option.id, option.key] }
      end

      def validate_distribution_options
        return if custom_field.blank? || distribution.blank?
        return if distribution.keys.to_set <= option_ids.to_set

        errors.add(:distribution, 'options must be a subset of the options of the associated custom field.')
      end

      def validate_custom_field_type
        super
        errors.add(:custom_field, <<-MSG) unless custom_field.input_type == 'select'
          input type must be 'select' for categorical distributions.
        MSG
      end
    end
  end
end
