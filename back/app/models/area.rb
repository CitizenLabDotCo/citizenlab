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
  has_and_belongs_to_many :static_pages

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }

  before_validation :sanitize_description_multiloc
  before_validation :strip_title

  # If the domicile custom field exists, each area is associated to one of its options.
  # The two associated resources are kept in sync: changes to the
  # area are reflected in the option, and vice versa.
  belongs_to :custom_field_option, optional: true
  after_create :recreate_custom_field_option
  after_update :update_custom_field_option
  before_destroy :destroy_custom_field_option
  before_destroy :validate_empty_static_pages

  validates :ordering, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0
  }, unless: ->(area) { area.ordering.nil? }

  def recreate_custom_field_option
    return unless (domicile_field = CustomField.find_by(key: 'domicile'))

    option_attrs = option_attributes(domicile_field)

    if custom_field_option.nil?
      create_custom_field_option!(option_attrs)
    else
      custom_field_option.update!(option_attrs)
      custom_field_option
    end
  end

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

  def update_custom_field_option
    return unless custom_field_option
    return unless ordering_previously_changed? || title_multiloc_previously_changed?

    custom_field_option.update!(
      title_multiloc: title_multiloc,
      ordering: ordering
    )
  end

  # The optional +domicile_field+ parameter is only there for performance
  # reasons.
  def option_attributes(domicile_field = nil)
    domicile_field ||= CustomField.find_by(key: 'domicile')
    return unless domicile_field

    {
      custom_field_id: domicile_field.id,
      title_multiloc: title_multiloc,
      ordering: ordering
    }
  end

  def destroy_custom_field_option
    return unless custom_field_option

    # TODO: (tech debt) Rework to log the user responsible for the deletion.
    SideFxCustomFieldOptionService.new.before_destroy(custom_field_option, nil)
    custom_field_option.destroy
    SideFxCustomFieldOptionService.new.after_destroy(custom_field_option, nil)
  end

  def validate_empty_static_pages
    return unless static_pages.exists?

    errors.add(:static_pages, 'linked_static_pages_exist')
    throw :abort
  end

  class << self
    def recreate_custom_field_options
      return unless (domicile_field = CustomField.find_by(key: 'domicile'))

      options = Area.all.map(&:recreate_custom_field_option)
      domicile_field.options.where.not(id: options).destroy_all
      options << create_somewhere_else_option
    end

    private

    def create_somewhere_else_option
      title_multiloc = CL2_SUPPORTED_LOCALES.index_with do |locale|
        I18n.t('custom_field_options.domicile.outside', locale: locale)
      end

      domicile_field = CustomField.find_by(key: 'domicile')
      domicile_field.options.create!(title_multiloc: title_multiloc)
    end
  end
end
