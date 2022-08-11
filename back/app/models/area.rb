# frozen_string_literal: true

# == Schema Information
#
# Table name: areas
#
#  id                     :uuid             not null, primary key
#  title_multiloc         :jsonb
#  description_multiloc   :jsonb
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  ordering               :integer
#  custom_field_option_id :uuid
#
# Indexes
#
#  index_areas_on_custom_field_option_id  (custom_field_option_id)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_option_id => custom_field_options.id)
#
class Area < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0
  default_scope -> { order(ordering: :asc) }

  has_many :areas_projects, dependent: :destroy
  has_many :projects, through: :areas_projects
  has_many :areas_initiatives, dependent: :destroy
  has_many :initiatives, through: :areas_initiatives

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }

  before_validation :sanitize_description_multiloc
  before_validation :strip_title

  # If the domicile custom field exists, area are associated to its options.
  # The two associated resources are kept in sync: changes mode to the
  # area are reflected in the option, and vice versa.
  belongs_to :custom_field_option, dependent: :destroy, optional: true
  after_create :create_custom_field_option
  after_update :update_custom_field_option

  validates :ordering, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0
  }, unless: ->(area) { area.ordering.nil? }

  private

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      description_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags description_multiloc
    self.description_multiloc = service.linkify_multiloc description_multiloc
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def create_custom_field_option
    return unless (domicile_field = CustomField.find_by(key: 'domicile'))

    create_custom_field_option!(
      custom_field: domicile_field,
      title_multiloc: title_multiloc,
      ordering: ordering
    )
  end

  def update_custom_field_option
    return unless custom_field_option
    return unless ordering_previously_changed? || title_multiloc_previously_changed?

    custom_field_option.update(
      title_multiloc: title_multiloc,
      ordering: ordering
    )
  end
end

