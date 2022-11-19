# frozen_string_literal: true

# Contains settings & configuration data of the homepage.
# == Schema Information
#
# Table name: home_pages
#
#  id                                       :uuid             not null, primary key
#  top_info_section_enabled                 :boolean          default(FALSE), not null
#  top_info_section_multiloc                :jsonb            not null
#  bottom_info_section_enabled              :boolean          default(FALSE), not null
#  bottom_info_section_multiloc             :jsonb            not null
#  events_widget_enabled                    :boolean          default(FALSE), not null
#  projects_enabled                         :boolean          default(TRUE), not null
#  projects_header_multiloc                 :jsonb            not null
#  banner_avatars_enabled                   :boolean          default(TRUE), not null
#  banner_layout                            :string           default("full_width_banner_layout"), not null
#  banner_signed_in_header_multiloc         :jsonb            not null
#  banner_cta_signed_in_text_multiloc       :jsonb            not null
#  banner_cta_signed_in_type                :string           default("no_button"), not null
#  banner_cta_signed_in_url                 :string
#  banner_signed_out_header_multiloc        :jsonb            not null
#  banner_signed_out_subheader_multiloc     :jsonb            not null
#  banner_signed_out_header_overlay_color   :string
#  banner_signed_out_header_overlay_opacity :integer
#  banner_cta_signed_out_text_multiloc      :jsonb            not null
#  banner_cta_signed_out_type               :string           default("sign_up_button"), not null
#  banner_cta_signed_out_url                :string
#  created_at                               :datetime         not null
#  updated_at                               :datetime         not null
#  header_bg                                :string
#
class HomePage < ApplicationRecord
  has_many :pins, as: :page, inverse_of: :page, dependent: :destroy
  has_many :pinned_admin_publications, through: :pins, source: :admin_publication

  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images

  accepts_nested_attributes_for :pinned_admin_publications, allow_destroy: true

  before_validation :sanitize_top_info_section_multiloc
  before_validation :sanitize_bottom_info_section_multiloc

  validate :only_one_home_page, on: :create

  validates :top_info_section_enabled, inclusion: [true, false]
  validates :top_info_section_multiloc, multiloc: { presence: false, html: true }

  validates :bottom_info_section_enabled, inclusion: [true, false]
  validates :bottom_info_section_multiloc, multiloc: { presence: false, html: true }

  validates :events_widget_enabled, inclusion: [true, false]
  validates :projects_enabled, inclusion: [true, false]

  validates :projects_header_multiloc, multiloc: true

  validates :banner_avatars_enabled, inclusion: [true, false]

  validates :banner_layout, inclusion: %w[full_width_banner_layout two_column_layout two_row_layout]
  validates :banner_signed_in_header_multiloc, multiloc: true

  validates :banner_signed_out_header_multiloc, multiloc: true
  validates :banner_signed_out_subheader_multiloc, multiloc: true
  validates :banner_signed_out_header_overlay_color, css_color: true
  validates :banner_signed_out_header_overlay_opacity, numericality: { only_integer: true,
                                                                       in: [0..100],
                                                                       allow_nil: true }

  validates :banner_cta_signed_in_type, inclusion: %w[customized_button no_button]
  validates :banner_cta_signed_out_type, inclusion: %w[sign_up_button customized_button no_button]

  with_options if: -> { banner_cta_signed_in_type == 'customized_button' } do
    validates :banner_cta_signed_in_text_multiloc, presence: true, multiloc: { presence: true }
    validates :banner_cta_signed_in_url, presence: true, url: true
  end

  with_options if: -> { banner_cta_signed_out_type == 'customized_button' } do
    validates :banner_cta_signed_out_text_multiloc, presence: true, multiloc: { presence: true }
    validates :banner_cta_signed_out_url, presence: true, url: true
  end

  mount_base64_uploader :header_bg, HeaderBgUploader

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

  # Validates that there is only one homepage. Adds an error in case a homepage record already exists.
  def only_one_home_page
    errors.add(:base, :invalid, message: 'There can be only one homepage record') if HomePage.exists?
  end
end
