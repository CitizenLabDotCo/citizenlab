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
#  followers_count        :integer          default(0), not null
#  include_in_onboarding  :boolean          default(FALSE), not null
#
# Indexes
#
#  index_areas_on_custom_field_option_id  (custom_field_option_id)
#  index_areas_on_include_in_onboarding   (include_in_onboarding)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_option_id => custom_field_options.id)
#
class Area < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0

  has_many :areas_projects, dependent: :destroy
  has_many :projects, through: :areas_projects
  has_many :followers, as: :followable, dependent: :destroy

  has_many :areas_static_pages, dependent: :restrict_with_error
  has_many :static_pages, through: :areas_static_pages

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }
  validates :include_in_onboarding, inclusion: { in: [true, false] }

  before_validation :sanitize_description_multiloc
  before_validation :sanitize_title_multiloc
  before_validation :strip_title

  # If the domicile custom field exists, each area is associated to one of its options.
  # The two associated resources are kept in sync: changes to the
  # area are reflected in the option, and vice versa.
  belongs_to :custom_field_option, optional: true
  after_create :recreate_custom_field_option
  after_update :update_custom_field_option
  before_destroy :destroy_custom_field_option

  validates :ordering, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0
  }, unless: ->(area) { area.ordering.nil? }

  scope :order_projects_count, lambda { |direction = :desc|
    safe_dir = direction == :desc ? 'DESC' : 'ASC'
    left_outer_joins(:areas_projects)
      .group(:id)
      .order("COUNT(areas_projects.project_id) #{safe_dir}, ordering")
  }

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

  def sanitize_title_multiloc
    return unless title_multiloc&.any?

    strip_title

    self.title_multiloc = SanitizationService.new.sanitize_multiloc(
      title_multiloc,
      []
    )
  end

  def strip_title
    return unless title_multiloc&.any?

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
    CustomFields::Options::DestroyService.new.destroy!(custom_field_option, nil)
  end

  class << self
    def recreate_custom_field_options
      return unless (domicile_field = CustomField.find_by(key: 'domicile'))

      # Caution: Custom fields must created in the correct order (that is according to
      # the ordering column), otherwise it could result in inconsistent ordering between
      # areas and their option. For example, if the option with ordering 1 is created
      # after the option with ordering 3, the latter will be adjusted (by acts_as_list)
      # to ordering 4.
      options = Area.order(:ordering).map(&:recreate_custom_field_option)
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

Area.include(SmartGroups::Concerns::ValueReferenceable)
