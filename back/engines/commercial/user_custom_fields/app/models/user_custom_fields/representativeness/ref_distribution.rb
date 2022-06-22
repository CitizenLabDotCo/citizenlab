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
#
# Indexes
#
#  index_ucf_representativeness_ref_distributions_on_custom_field  (custom_field_id)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id)
#
class UserCustomFields::Representativeness::RefDistribution < ApplicationRecord
  belongs_to :custom_field
  has_many :values, through: :custom_field, source: :options

  validates :custom_field_id, uniqueness: true
  validates :distribution, presence: true, length: { minimum: 2, message: 'must have at least 2 options.' }
  validate :validate_distribution_options
  validate :validate_distribution_counts

  def probabilities_and_counts
    distribution.merge(probabilities) do |_option_id, count, probability|
      { count: count, probability: probability }
    end
  end

  # Returns the expected count distribution for a given (total) number of users.
  def expected_counts(nb_users)
    probabilities.transform_values { |probability| (probability * nb_users).round(1) }
  end

  def validate_distribution_options
    return if custom_field.blank? || distribution.blank?
    return if distribution.keys.to_set <= value_ids.to_set

    errors.add(:distribution, 'options must be a subset of the options of the associated custom field.')
  end

  def validate_distribution_counts
    return if custom_field.blank? || distribution.blank?

    counts = distribution.values
    errors.add(:distribution, 'population counts cannot be nil.') if counts.any?(&:nil?)

    counts.compact!
    errors.add(:distribution, 'population counts must be strictly positive.') unless counts.all?(&:positive?)
    errors.add(:distribution, 'population counts must be integers.') unless counts.all?(&:integer?)
  end

  private

  def total_population
    @total_population ||= distribution.values.sum
  end

  def probabilities
    distribution.transform_values { |count| count.to_f / total_population }
  end
end
