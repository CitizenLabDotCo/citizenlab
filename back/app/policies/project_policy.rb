# frozen_string_literal: true

class ProjectPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      @scope = scope.includes(:admin_publication)

      # Resolves the scope as a disjunction (OR) of scopes, one scope (= one clause) for each 'role' a user can have.
      # It entails that scopes does not have to be redundant. In other words, each sub-scope (clause) should aim to
      # include only the projects to which this role gives access (without repeating projects to which lesser roles
      # of the user gives access).
      moderator_scope = user&.active? ? UserRoleService.new.moderatable_projects(user, scope) : scope.none

      moderator_scope
        .or(resolve_for_visitor)
        .or(resolve_for_normal_user)
    end

    private

    # Filter the scope for a user that is not logged in.
    def resolve_for_visitor
      publicly_visible = scope.publicly_visible
      publicly_visible.not_draft
        .or(publicly_visible.draft.where(preview_token: context[:project_preview_token]))
    end

    def resolve_for_normal_user
      return scope.none unless user

      user_groups_visible = scope.user_groups_visible(user)
      user_groups_visible.not_draft
        .or(user_groups_visible.draft.where(preview_token: context[:project_preview_token]))
    end
  end

  # The normal scope: Given this user, which resources can she access?
  # The inverse scope: Given this resource, which users can access it?
  class InverseScope
    attr_reader :record, :scope

    def initialize(record, scope)
      @record = record
      @scope = scope
    end

    def resolve
      return scope.all if record.visible_to == 'public' && record.admin_publication.publication_status != 'draft'

      moderator_scope = UserRoleService.new.moderators_for_project record, scope
      if record.visible_to == 'groups' && record.admin_publication.publication_status != 'draft'
        scope.in_any_group(record.groups).or(moderator_scope)
      else
        moderator_scope
      end
    end
  end

  def index_xlsx?
    active_moderator?
  end

  def index_finished_or_archived?
    true
  end

  def index_for_followed_item?
    true
  end

  def index_with_active_participatory_phase?
    true
  end

  def index_for_areas?
    true
  end

  def index_for_topics?
    true
  end

  def index_for_admin?
    user&.admin? || user&.project_moderator? || user&.project_folder_moderator?
  end

  def votes_by_user_xlsx?
    index_xlsx?
  end

  def votes_by_input_xlsx?
    index_xlsx?
  end

  def create?
    return false unless active?
    return true if admin?

    if record.folder
      UserRoleService.new.can_moderate?(record.folder, user)
    else
      record.admin_publication.draft? && (user.project_moderator? || user.project_folder_moderator?)
    end
  end

  def show?
    return false if Permissions::ProjectPermissionsService.new(record, user).project_visible_disabled_reason

    active_moderator? || project_published_or_archived? || project_preview?
  end

  def by_slug?
    show?
  end

  def update?
    active_moderator?
  end

  def refresh_preview_token?
    update?
  end

  def reorder?
    update?
  end

  def destroy?
    return false unless active?

    admin? || (active_moderator? && record.never_published?)
  end

  def copy?
    active_moderator?
  end

  def destroy_participation_data?
    active_moderator?
  end

  def shared_permitted_attributes
    shared = [
      :slug,
      :header_bg,
      :visible_to,
      :include_all_areas,
      {
        title_multiloc: CL2_SUPPORTED_LOCALES,
        description_multiloc: CL2_SUPPORTED_LOCALES,
        description_preview_multiloc: CL2_SUPPORTED_LOCALES,
        voting_term_singular_multiloc: CL2_SUPPORTED_LOCALES,
        voting_term_plural_multiloc: CL2_SUPPORTED_LOCALES,
        area_ids: [],
        topic_ids: [],
        header_bg_alt_text_multiloc: CL2_SUPPORTED_LOCALES
      }
    ]

    if AppConfiguration.instance.feature_activated? 'disable_disliking'
      shared += %i[reacting_dislike_enabled reacting_dislike_method reacting_dislike_limited_max]
    end
    shared
  end

  def permitted_attributes_for_create
    shared_permitted_attributes.tap do |attrs|
      nested_attrs = attrs.find { |attr| attr.is_a?(Hash) }
      nested_attrs.deep_merge!({ admin_publication_attributes: [:publication_status] })
    end
  end

  def permitted_attributes_for_update
    shared_permitted_attributes.tap do |attrs|
      next unless update_status?

      nested_attrs = attrs.find { |attr| attr.is_a?(Hash) }
      nested_attrs.deep_merge!({ admin_publication_attributes: [:publication_status] })
    end
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end

  def active_moderator?
    return unless active?

    UserRoleService.new.can_moderate_project? record, user
  end

  def community_monitor?
    show?
  end

  private

  def update_status?
    admin_like? || record.ever_published? || record.review&.approved?
  end

  def admin_like?
    admin? || folder_moderator?
  end

  def folder_moderator?
    record.folder && UserRoleService.new.can_moderate?(record.folder, user)
  end

  def project_preview?
    return false unless record.admin_publication.publication_status == 'draft'

    context[:project_preview_token] && context[:project_preview_token] == record.preview_token
  end

  def project_published_or_archived?
    %w[published archived].include?(record.admin_publication.publication_status)
  end
end

ProjectPolicy.prepend(Polls::Patches::ProjectPolicy)
ProjectPolicy.prepend(IdeaAssignment::Patches::ProjectPolicy)
ProjectPolicy.prepend(BulkImportIdeas::Patches::ProjectPolicy)
