# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_field_options
#
#  id              :uuid             not null, primary key
#  custom_field_id :uuid
#  key             :string
#  title_multiloc  :jsonb
#  ordering        :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  other           :boolean          default(FALSE), not null
#
# Indexes
#
#  index_custom_field_options_on_custom_field_id          (custom_field_id)
#  index_custom_field_options_on_custom_field_id_and_key  (custom_field_id,key) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id)
#
class CustomFieldOption < ApplicationRecord
  # non-persisted attribute to enable form copying
  attribute :temp_id, :string, default: nil

  acts_as_list column: :ordering, top_of_list: 0, scope: :custom_field

  belongs_to :custom_field

  validates :custom_field, presence: true
  validates :key, presence: true, uniqueness: { scope: [:custom_field_id] },
    format: { with: /\A[\w-]+\z/, message: 'can only consist of word characters or dashes' }
  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validate :belongs_to_select_field

  before_validation :generate_key, on: :create
  before_validation :sanitize_title_multiloc, if: :title_multiloc

  # Options of the domicile custom field are associated with an area.
  # The two associated resources are kept in sync: changes to the
  # area are reflected in the option, and vice versa.
  has_one :area, dependent: :nullify
  after_update :update_area

  has_one :image, dependent: :destroy, class_name: 'CustomFieldOptionImage', inverse_of: :custom_field_option
  has_many :custom_field_bins, dependent: :destroy, class_name: 'CustomFieldBins::OptionBin', inverse_of: :custom_field_option

  delegate :project_id, to: :custom_field

  private

  def belongs_to_select_field
    return unless custom_field && !custom_field.support_options?

    errors.add(
      :base,
      :option_on_non_select_field,
      message: 'The custom field option you\'re specifying does not belong to a custom field that supports options'
    )
  end

  def update_area
    return unless area
    return unless ordering_previously_changed? || title_multiloc_previously_changed?

    area.update!(
      ordering: ordering,
      title_multiloc: title_multiloc
    )
  end

  def generate_key
    return if key

    title = title_multiloc.values.first
    return unless title

    self.key = CustomFieldService.new.generate_key(title, other_option: other) do |key_proposal|
      self.class.find_by(key: key_proposal, custom_field: custom_field)
    end
  end

  def sanitize_title_multiloc
    self.title_multiloc = SanitizationService.new.sanitize_multiloc(
      title_multiloc,
      []
    )
  end
end

CustomFieldOption.include(SmartGroups::Extensions::CustomFieldOption)
CustomFieldOption.include(UserCustomFields::Patches::CustomFieldOption)
