# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_pages
#
#  id                           :uuid             not null, primary key
#  title_multiloc               :jsonb            not null
#  slug                         :string
#  banner_enabled               :boolean          default(TRUE), not null
#  banner_layout                :string           default("full_width_banner_layout"), not null
#  banner_overlay_color         :string
#  banner_overlay_opacity       :integer
#  banner_cta_button_multiloc   :jsonb            not null
#  banner_cta_button_type       :string           default("no_button"), not null
#  banner_cta_url               :string
#  banner_header_multiloc       :jsonb            not null
#  banner_subheader_multiloc    :jsonb            not null
#  top_info_section_enabled     :boolean          default(FALSE), not null
#  top_info_section_multiloc    :jsonb            not null
#  projects_enabled             :boolean          default(FALSE), not null
#  projects_filter_type         :string
#  events_enabled               :boolean          default(FALSE), not null
#  bottom_info_section_enabled  :boolean          default(FALSE), not null
#  bottom_info_section_multiloc :jsonb            not null
#  header_bg                    :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#
# Contains settings & configuration data of a custom page.
class CustomPage < ApplicationRecord
end
