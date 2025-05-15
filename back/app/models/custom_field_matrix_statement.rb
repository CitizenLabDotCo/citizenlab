# == Schema Information
#
# Table name: custom_field_matrix_statements
#
#  id              :uuid             not null, primary key
#  custom_field_id :uuid             not null
#  title_multiloc  :jsonb            not null
#  key             :string           not null
#  ordering        :integer          not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_custom_field_matrix_statements_on_custom_field_id  (custom_field_id)
#  index_custom_field_matrix_statements_on_key              (key)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id)
#
class CustomFieldMatrixStatement < ApplicationRecord
  # non-persisted attribute to enable form copying
  attribute :temp_id, :string, default: nil

  belongs_to :custom_field

  before_validation :generate_key, on: :create
  before_validation :sanitize_title_multiloc
  acts_as_list column: :ordering, top_of_list: 0, scope: :custom_field

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :key, presence: true, uniqueness: { scope: [:custom_field_id] },
    format: { with: /\A[\w-]+\z/ } # Can only consist of word characters or dashes
  validates :custom_field, presence: true

  private

  def generate_key
    title = title_multiloc.values.first
    self.key ||= title && CustomFieldService.new.generate_key(title)
  end

  def sanitize_title_multiloc
    return {} unless title_multiloc&.any?

    self.title_multiloc = SanitizationService.new.sanitize_multiloc(
      title_multiloc,
      []
    )
  end
end
