# frozen_string_literal: true

class StaticPagePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.all if user&.active? && user.admin?

      # Global pages (no project) are public. A project-scoped page is only
      # visible when its project is visible to this user - i.e. published and
      # accessible, or moderated by them - so a draft/hidden project doesn't
      # leak its pages.
      visible_projects = ProjectPolicy::Scope.new(user_context, Project).resolve
      scope.where(project_id: nil).or(scope.where(project: visible_projects))
    end
  end

  def show?
    # Global pages stay public; project pages follow their project's visibility.
    record.project_id.nil? || scope.exists?(id: record.id)
  end

  def by_slug?
    show?
  end

  def create?
    return false unless user&.active?
    return true if user.admin?

    # Moderators may only create pages for a project they moderate. They can
    # never create a global (projectless) page.
    record.project_id.present? && moderates_page_project?
  end

  def update?
    return false unless user&.active?
    return true if user.admin?

    # Moderators may edit pages of projects they moderate, but never reassign a
    # page to a different project.
    record.project_id.present? &&
      !record.project_id_changed? &&
      moderates_page_project?
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
      :project_id,
      { area_ids: [] },
      { global_topic_ids: [] },
      { space_ids: [] },
      { nav_bar_item_title_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end

  private

  def moderates_page_project?
    UserRoleService.new.can_moderate_project?(record.project, user)
  end
end
