class CustomFieldStatement < ApplicationRecord
  belongs_to :custom_field

  attribute :key, :string, default: -> { generate_key }

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :custom_field, :key, presence: true

  private

  def generate_key
    title = title_multiloc.values.first
    title && CustomFieldService.new.generate_key(title)
  end
end
