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

  validates :custom_field_id, uniqueness: true
  validates :distribution, presence: true, length: { minimum: 2, message: 'must have at least 2 options.' }
  validate :validate_distribution_options

  def total_count
    distribution.values.sum
  end

  # TODO: better name (bc there are both counts and probabilities)
  def normalized_distribution
    distribution.transform_values do |count|
      { count: count, probability: count.to_f / total_count }
    end
  end

  def validate_distribution_options
    return if custom_field.blank?
    return if distribution.blank?

    unless distribution.keys.to_set <= custom_field.custom_field_option_ids.to_set
      errors.add(:distribution, 'options must be a subset of the options of the associated custom field.')
    end
  end
end
