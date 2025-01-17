class CustomFieldStatement < ApplicationRecord
  belongs_to :custom_field

  attribute :key, :string, default: -> { generate_key }
  acts_as_list column: :ordering, top_of_list: 0, scope: :custom_field

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :key, presence: true, uniqueness: { scope: [:custom_field_id] },
    format: { with: /\A[\w-]+\z/ } # Can only consist of word characters or dashes
  validates :custom_field, presence: true

  private

  def generate_key
    title = title_multiloc.values.first
    title && CustomFieldService.new.generate_key(title)
  end
end
