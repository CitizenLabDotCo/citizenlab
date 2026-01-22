# frozen_string_literal: true

class StaticPagePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end

  def show?
    true
  end

  def by_slug?
    show?
  end

  def create?
    user&.active? && user.admin?
  end

  def update?
    user&.active? && user.admin?
  end

  def destroy?
    update?
  end

  def permitted_attributes
    [
      { title_multiloc: CL2_SUPPORTED_LOCALES },
      { top_info_section_multiloc: CL2_SUPPORTED_LOCALES },
      :slug,
      :banner_enabled,
      :banner_layout,
      :banner_overlay_color,
      :banner_overlay_opacity,
      { banner_cta_button_multiloc: CL2_SUPPORTED_LOCALES },
      :banner_cta_button_type,
      :banner_cta_button_url,
      { banner_header_multiloc: CL2_SUPPORTED_LOCALES },
      { banner_subheader_multiloc: CL2_SUPPORTED_LOCALES },
      :top_info_section_enabled,
      :files_section_enabled,
      :projects_enabled,
      :projects_filter_type,
      :events_widget_enabled,
      :bottom_info_section_enabled,
      { bottom_info_section_multiloc: CL2_SUPPORTED_LOCALES },
      :header_bg,
      { area_ids: [] },
      { global_topic_ids: [] },
      { nav_bar_item_title_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end
end
