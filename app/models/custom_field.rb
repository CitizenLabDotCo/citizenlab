class CustomField < ApplicationRecord

  has_many :custom_field_options, dependent: :destroy

  FIELDABLE_TYPES = %w(User)
  INPUT_TYPES = %w(text multiline_text select multiselect checkbox date)

  validates :resource_type, presence: true, inclusion: {in: FIELDABLE_TYPES}
  validates :key, presence: true, uniqueness: {scope: [:resource_type]}, format: { with: /\A[a-zA-Z0-9_]+\z/,
    message: "only letters, numbers and underscore" }
  validates :input_type, presence: true, inclusion: INPUT_TYPES
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, presence: true, multiloc: {presence: false}
  validates :required, inclusion: {in: [true, false]}
  validates :ordering, numericality: { only_integer: true }, allow_nil: true

  def support_options?
    %w(select multiselect).include?(input_type)
  end
end
