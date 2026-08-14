# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_field_answers
#
#  id              :uuid             not null, primary key
#  answerable_type :string           not null
#  answerable_id   :uuid             not null
#  custom_field_id :uuid
#  key             :string           not null
#  value           :jsonb            not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_custom_field_answers_on_answerable_and_key       (answerable_type,answerable_id,key) UNIQUE
#  index_custom_field_answers_on_custom_field_id          (custom_field_id)
#  index_custom_field_answers_on_key_and_answerable_type  (key,answerable_type)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id) ON DELETE => cascade
#
class CustomFieldAnswer < ApplicationRecord
  ANSWERABLE_TYPES = %w[Idea User].freeze

  belongs_to :answerable, polymorphic: true
  belongs_to :custom_field, optional: true

  scope :main_for, ->(field) { where(custom_field: field, key: field.key) }

  validates :answerable_type, inclusion: { in: ANSWERABLE_TYPES }
  validates :key, presence: true
  # presence would reject false/[]; exclusion checks arrays element-wise.
  validate :value_is_not_nil

  private

  def value_is_not_nil
    errors.add(:value, 'must not be nil') if value.nil?
  end
end
