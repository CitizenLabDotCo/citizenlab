# frozen_string_literal: true

# Contains settings & configuration data of the homepage.
# == Schema Information
#
# Table name: home_pages
#
#  id                                       :uuid             not null, primary key
#  top_info_section_enabled                 :boolean          default(TRUE), not null
#  top_info_section_multiloc                :jsonb            not null
#  bottom_info_section_enabled              :boolean          default(TRUE), not null
#  bottom_info_section_multiloc             :jsonb            not null
#  events_enabled                           :boolean          default(FALSE), not null
#  projects_enabled                         :boolean          default(TRUE), not null
#  projects_header                          :jsonb            not null
#  banner_avatars_enabled                   :boolean          default(TRUE), not null
#  banner_enabled                           :boolean          default(TRUE), not null
#  banner_layout                            :string           default("full_width_banner_layout"), not null
#  banner_signed_in_header_multiloc         :jsonb            not null
#  banner_signed_in_text_multiloc           :jsonb            not null
#  banner_signed_in_type                    :string           default("no_button"), not null
#  banner_signed_in_url                     :string
#  banner_signed_out_header_multiloc        :jsonb            not null
#  banner_signed_out_subheader_multiloc     :jsonb            not null
#  banner_signed_out_header_overlay_color   :string
#  banner_signed_out_header_overlay_opacity :integer
#  banner_signed_out_text_multiloc          :jsonb            not null
#  banner_signed_out_type                   :string           default("sign_up_button"), not null
#  banner_signed_out_url                    :string
#  created_at                               :datetime         not null
#  updated_at                               :datetime         not null
#
class HomePage < ApplicationRecord
  before_validation :sanitize_top_info_section_multiloc, if: :top_info_section_enabled
  before_validation :sanitize_bottom_info_section_multiloc, if: :bottom_info_section_enabled

  validates :top_info_section_enabled, inclusion: [true, false]
  validates :top_info_section_multiloc, presence: true, multiloc: { html: true, presence: true }, if: :top_info_section_enabled

  validates :bottom_info_section_enabled, inclusion: [true, false]
  validates :bottom_info_section_multiloc, presence: true, multiloc: { html: true, presence: true }, if: :bottom_info_section_enabled

  validates :events_enabled, inclusion: [true, false]
  validates :projects_enabled, inclusion: [true, false]

  validates :banner_avatars_enabled, inclusion: [true, false]
  validates :banner_enabled, inclusion: [true, false]
  validates :banner_layout, inclusion: %w[full_width_banner_layout two_column_layout two_row_layout]
  validates :banner_signed_in_header_multiloc, presence: true, multiloc: true
  validates :banner_signed_in_text_multiloc, presence: true, multiloc: true
  validates :banner_signed_in_type, inclusion: %w[customized_button no_button]

  validates :banner_signed_out_header_multiloc, presence: true, multiloc: true
  validates :banner_signed_out_subheader_multiloc, presence: true, multiloc: true
  validates :banner_signed_out_header_overlay_color, css_color: true
  validates :banner_signed_out_header_overlay_opacity, numericality: { only_integer: true,
                                                                       in: [0..100],
                                                                       allow_nil: true }
  validates :banner_signed_out_text_multiloc, presence: true, multiloc: true
  validates :banner_signed_out_type, inclusion: %w[sign_up_button customized_button no_button]

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
    @service ||= SanitizationService.new

    self[attribute] = @service.sanitize_multiloc(self[attribute], %i[title alignment list decoration link image video])
    self[attribute] = @service.remove_multiloc_empty_trailing_tags(self[attribute])
    self[attribute] = @service.linkify_multiloc(self[attribute])
  end
end
