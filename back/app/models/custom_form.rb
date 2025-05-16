# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_forms
#
#  id                         :uuid             not null, primary key
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  participation_context_id   :uuid             not null
#  participation_context_type :string           not null
#  fields_last_updated_at     :datetime         not null
#  print_start_multiloc       :jsonb            not null
#  print_end_multiloc         :jsonb            not null
#
# Indexes
#
#  index_custom_forms_on_participation_context  (participation_context_id,participation_context_type) UNIQUE
#
class CustomForm < ApplicationRecord
  belongs_to :participation_context, polymorphic: true
  has_many :custom_fields, -> { order(:ordering) }, as: :resource, dependent: :destroy, inverse_of: :resource

  validates :participation_context, presence: true
  validates :participation_context_id, uniqueness: { scope: %i[participation_context_type] } # https://github.com/rails/rails/issues/34312#issuecomment-586870322

  delegate :project_id, to: :participation_context

  before_validation :sanitize_print_start_multiloc
  before_validation :sanitize_print_end_multiloc

  # Fixes custom fields ordering by:
  # - Moving the first container field (page) to the first position if any
  # - Ensuring consecutive integers without gaps or duplicates
  #
  # This method can be removed once we are confident that inconsistencies in the ordering
  # are no longer introduced.
  def heal_fields_ordering!
    CustomForm.transaction do
      fields = custom_fields.to_a

      first_container_idx = fields.index(&:page?)
      fields.insert(0, fields.delete_at(first_container_idx)) if first_container_idx&.positive?

      fields.each.with_index do |field, index|
        next if field.ordering == index

        logger.debug('Healing field ordering', field_id: field.id, from: field.ordering, to: index)
        field.update_column(:ordering, index)
      end
    end
  end

  # Timestamp when the fields (not the form) were last updated.
  def fields_updated!
    update!(fields_last_updated_at: Time.now)
  end

  private

  def sanitize_print_start_multiloc
    return unless print_start_multiloc&.any?

    self.print_start_multiloc = sanitize_multiloc(print_start_multiloc)
  end

  def sanitize_print_end_multiloc
    return unless print_end_multiloc&.any?

    self.print_end_multiloc = sanitize_multiloc(print_end_multiloc)
  end

  def sanitize_multiloc(multiloc)
    service = SanitizationService.new

    multiloc = service.sanitize_multiloc(
      multiloc,
      %i[title alignment list decoration image]
    )

    service.remove_multiloc_empty_trailing_tags multiloc
  end
end
