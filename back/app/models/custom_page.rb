# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_pages
#
#  id                           :uuid             not null, primary key
#  title_multiloc               :jsonb            not null
#  slug                         :string
#  code                         :string           default("custom"), not null
#  banner_enabled               :boolean          default(TRUE), not null
#  banner_layout                :string           default("full_width_banner_layout"), not null
#  banner_overlay_color         :string
#  banner_overlay_opacity       :integer
#  banner_cta_button_multiloc   :jsonb            not null
#  banner_cta_button_type       :string           default("no_button"), not null
#  banner_cta_button_url        :string
#  banner_header_multiloc       :jsonb            not null
#  banner_subheader_multiloc    :jsonb            not null
#  top_info_section_enabled     :boolean          default(FALSE), not null
#  top_info_section_multiloc    :jsonb            not null
#  projects_enabled             :boolean          default(FALSE), not null
#  projects_filter_type         :string
#  events_widget_enabled        :boolean          default(FALSE), not null
#  bottom_info_section_enabled  :boolean          default(FALSE), not null
#  bottom_info_section_multiloc :jsonb            not null
#  header_bg                    :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#
# Indexes
#
#  index_custom_pages_on_code  (code)
#  index_custom_pages_on_slug  (slug) UNIQUE
#
class CustomPage < ApplicationRecord
  CODES = %w[about faq proposals custom].freeze

  has_many :pins, as: :page, inverse_of: :page, dependent: :destroy
  has_many :pinned_admin_publications, through: :pins, source: :admin_publication

  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images

  has_many :custom_page_files, -> { order(:ordering) }, dependent: :destroy, inverse_of: :custom_page

  accepts_nested_attributes_for :pinned_admin_publications, allow_destroy: true

  before_validation :sanitize_top_info_section_multiloc
  before_validation :sanitize_bottom_info_section_multiloc

  validates :title_multiloc, presence: true, multiloc: { presence: true }

  validates :slug, presence: true, uniqueness: true

  validates :code, inclusion: { in: CODES }
  validates uniqueness: true, unless: :custom?

  validates :banner_enabled, inclusion: [true, false] # Default is true on db table, perhaps should be false on db table?
  validates :banner_layout, inclusion: %w[full_width_banner_layout two_column_layout two_row_layout]
  validates :banner_overlay_color, css_color: true
  validates :banner_overlay_opacity, numericality: { only_integer: true,
                                                     in: [0..100],
                                                     allow_nil: true }
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
    validates :projects_filter_type, presence: true, inclusion: %w[area topics]
  end

  validates :events_widget_enabled, inclusion: [true, false]

  validates :bottom_info_section_enabled, inclusion: [true, false]
  validates :bottom_info_section_multiloc, multiloc: { presence: false, html: true }

  mount_base64_uploader :header_bg, HeaderBgUploader

  def custom?
    code == 'custom'
  end

  private

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
end
