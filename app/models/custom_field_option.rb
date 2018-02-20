class CustomFieldOption < ApplicationRecord
  belongs_to :custom_field

  validates :custom_field, presence: true
  validates :key, presence: true, uniqueness: {scope: [:custom_field_id]}
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :is_default, inclusion: {in: [true, false]}
  validates :ordering, numericality: { only_integer: true }, allow_nil: true
  validate :belongs_to_select_field

  def belongs_to_select_field
    unless custom_field&.support_options?
      self.errors.add(
        :base,
        :option_on_non_select_field,
        message: 'The custom field option you\'re specifying does not belong to a custom field that supports options'
      )
    end
  end
end
