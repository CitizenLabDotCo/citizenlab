# frozen_string_literal: true

# == Schema Information
#
# Table name: static_pages
#
#  id                           :uuid             not null, primary key
#  title_multiloc               :jsonb
#  slug                         :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  code                         :string           not null
#  top_info_section_multiloc    :jsonb            not null
#  banner_enabled               :boolean          default(FALSE), not null
#  banner_layout                :string           default("full_width_banner_layout"), not null
#  banner_overlay_color         :string
#  banner_overlay_opacity       :integer
#  banner_cta_button_multiloc   :jsonb            not null
#  banner_cta_button_type       :string           default("no_button"), not null
#  banner_cta_button_url        :string
#  banner_header_multiloc       :jsonb            not null
#  banner_subheader_multiloc    :jsonb            not null
#  top_info_section_enabled     :boolean          default(FALSE), not null
#  files_section_enabled        :boolean          default(FALSE), not null
#  projects_enabled             :boolean          default(FALSE), not null
#  projects_filter_type         :string           default("no_filter"), not null
#  events_widget_enabled        :boolean          default(FALSE), not null
#  bottom_info_section_enabled  :boolean          default(FALSE), not null
#  bottom_info_section_multiloc :jsonb            not null
#  header_bg                    :string
#
# Indexes
#
#  index_static_pages_on_code  (code)
#  index_static_pages_on_slug  (slug) UNIQUE
#
class StaticPage < ApplicationRecord
  CODES = %w[about cookie-policy terms-and-conditions privacy-policy faq custom].freeze
  RESERVED_SLUGS = (CODES - %w[custom]).freeze

  slug from: proc { |page| page.title_multiloc.values.find(&:present?) }, except: RESERVED_SLUGS

  enum :projects_filter_type, { no_filter: 'no_filter', areas: 'areas', topics: 'topics' }

  has_one :nav_bar_item, dependent: :destroy
  has_many :static_page_files, -> { order(:ordering) }, dependent: :destroy
  has_many :text_images, as: :imageable, dependent: :destroy

  has_many :static_pages_topics, dependent: :destroy
  has_many :topics, -> { order(:ordering) }, through: :static_pages_topics

  has_many :areas_static_pages, dependent: :destroy
  has_many :areas, through: :areas_static_pages

  accepts_nested_attributes_for :nav_bar_item
  accepts_nested_attributes_for :text_images

  before_validation :set_code, on: :create

  before_validation :sanitize_title_multiloc
  before_validation :sanitize_banner_cta_button_multiloc
  before_validation :sanitize_banner_subheader_multiloc
  before_validation :strip_title
  before_validation :sanitize_top_info_section_multiloc
  before_validation :sanitize_bottom_info_section_multiloc
  before_validation :destroy_obsolete_associations

  before_destroy :check_if_destroyable, prepend: true

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :code, inclusion: { in: CODES }
  validates :code, uniqueness: true, unless: :custom?
  validate :validate_slug

  validates :banner_enabled, inclusion: [true, false]
  validates :banner_layout, inclusion: %w[full_width_banner_layout two_column_layout two_row_layout fixed_ratio_layout]
  validates :banner_overlay_color, css_color: true
  validates :banner_overlay_opacity, numericality: { only_integer: true, in: 0..100, allow_nil: true }
  validates :banner_header_multiloc, multiloc: true
  validates :banner_subheader_multiloc, multiloc: true
  validates :banner_cta_button_type, inclusion: %w[customized_button no_button]
  with_options if: -> { banner_cta_button_type == 'customized_button' } do
    validates :banner_cta_button_multiloc, presence: true, multiloc: { presence: true }
    validates :banner_cta_button_url, presence: true, url: true
  end

  validates :top_info_section_enabled, inclusion: [true, false]
  validates :top_info_section_multiloc, multiloc: { presence: false, html: true }

  validates :projects_enabled, inclusion: [true, false]
  with_options if: -> { projects_enabled == true } do
    validates :projects_filter_type, presence: true
  end

  validates :events_widget_enabled, inclusion: [true, false]

  validates :bottom_info_section_enabled, inclusion: [true, false]
  validates :bottom_info_section_multiloc, multiloc: { presence: false, html: true }
  validates(
    :areas, length: { is: 1 },
    if: lambda do
      # The validation is skipped when loading a tenant template because it assumes the
      # existence of AreasStaticPage records that are not created yet. (When loading a
      # tenant template, AreasStaticPage records are created after StaticPage records
      # because of their `belongs_to :static_page` association that references StaticPage
      # records.)
      projects_filter_type == self.class.projects_filter_types.fetch(:areas) && !Current.loading_tenant_template
    end
  )
  validates(
    :topics, length: { minimum: 1 },
    if: lambda do
      # The validation is skipped when loading a tenant template because it assumes the
      # existence of StaticPagesTopics records that are not created yet. (When loading a
      # tenant template, StaticPagesTopics records are created after StaticPage records
      # because of their `belongs_to :static_page` association that references StaticPage
      # records.)
      projects_filter_type == self.class.projects_filter_types.fetch(:topics) && !Current.loading_tenant_template
    end
  )

  mount_base64_uploader :header_bg, HeaderBgUploader

  class << self
    def associations_project_filter_types
      no_filter = projects_filter_types.fetch(:no_filter)
      projects_filter_types.except(no_filter)
    end
  end

  def custom?
    code == 'custom'
  end

  def filter_projects(projects_scope)
    options =
      case projects_filter_type
      when self.class.projects_filter_types.fetch(:areas)
        { areas: areas_static_pages.pluck(:area_id) }
      when self.class.projects_filter_types.fetch(:topics)
        { topics: static_pages_topics.pluck(:topic_id) }
      else
        {}
      end

    ProjectsFilteringService.new.filter(projects_scope, options)
  end

  private

  def check_if_destroyable
    # The cookie policy page can be deleted because the frontend will automatically fall
    # back to the default policy if it's missing (which is the usual case).
    return if custom? || code == 'cookie-policy'

    errors.add(:base, 'Only custom pages and the cookie policy page can be deleted')
    throw :abort
  end

  def validate_slug
    errors.add(:slug, 'reserved') if custom? && slug.in?(RESERVED_SLUGS)
  end

  def set_code
    self.code ||= 'custom'
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def sanitize_top_info_section_multiloc
    sanitize_info_section_multiloc(:top_info_section_multiloc)
  end

  def sanitize_bottom_info_section_multiloc
    sanitize_info_section_multiloc(:bottom_info_section_multiloc)
  end

  # Sanitizes an info section multiloc.
  # - Removes invalid HTML
  # - Removes empty trailing tags
  # - Automatically links URLs
  def sanitize_info_section_multiloc(attribute)
    return if self[attribute].nil?

    @service ||= SanitizationService.new

    self[attribute] = @service.sanitize_multiloc(self[attribute], %i[title alignment list decoration link image video])
    self[attribute] = @service.remove_multiloc_empty_trailing_tags(self[attribute])
    self[attribute] = @service.linkify_multiloc(self[attribute])
  end

  def sanitize_title_multiloc
    return unless title_multiloc&.any?

    self.title_multiloc = SanitizationService.new.sanitize_multiloc(
      title_multiloc,
      []
    )
  end

  def sanitize_banner_cta_button_multiloc
    return unless banner_cta_button_multiloc&.any?

    self.banner_cta_button_multiloc = SanitizationService.new.sanitize_multiloc(
      banner_cta_button_multiloc,
      []
    )
  end

  def sanitize_banner_subheader_multiloc
    return unless banner_subheader_multiloc&.any?

    self.banner_subheader_multiloc = SanitizationService.new.sanitize_multiloc(
      banner_subheader_multiloc,
      []
    )
  end

  def destroy_obsolete_associations
    (self.class.associations_project_filter_types.values - [projects_filter_type]).each do |association|
      public_send(association).destroy_all
    end
  end
end
