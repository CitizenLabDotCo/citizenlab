# frozen_string_literal: true

class ProjectPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope.includes(:admin_publication)
    end

    def resolve
      # Resolves the scope as a disjunction (OR) of scopes, one scope (= one clause) for each 'role' a user can have.
      # It entails that scopes does not have to be redundant. In other words, each sub-scope (clause) should aim to
      # include only the projects to which this role gives access (without repeating projects to which lesser roles
      # of the user gives access).
      moderator_scope = if user&.active?
        UserRoleService.new.moderatable_projects(user, scope)
      else
        scope.none
      end
      moderator_scope
        .or(resolve_for_visitor)
        .or(resolve_for_normal_user)
    end

    private

    def resolve_for_admin
      user&.admin? ? scope : scope.none
    end

    # Filter the scope for a user that is not logged in.
    def resolve_for_visitor
      scope.not_draft.publicly_visible
    end

    def resolve_for_normal_user
      return scope.none unless user

      scope.user_groups_visible(user).not_draft
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

  def survey_results?
    active_moderator?
  end

  def submission_count?
    show?
  end

  def delete_inputs?
    record.continuous? && active_moderator?
  end

  def create?
    return false unless active?
    return true if admin?

    record.folder && UserRoleService.new.can_moderate?(record.folder, user)
  end

  def show?
    active_moderator? || (
      %w[published archived].include?(record.admin_publication.publication_status) && (
        record.visible_to == 'public' || (
          user &&
          record.visible_to == 'groups' &&
          user.in_any_groups?(record.groups)
        )
      )
    )
  end

  def by_slug?
    show?
  end

  def update?
    active_moderator?
  end

  def reorder?
    update?
  end

  def destroy?
    active? && admin?
  end

  def copy?
    create?
  end

  def shared_permitted_attributes
    shared = [
      :slug,
      :header_bg,
      :visible_to,
      :participation_method,
      :posting_enabled,
      :posting_method,
      :posting_limited_max,
      :commenting_enabled,
      :reacting_enabled,
      :reacting_like_method,
      :reacting_like_limited_max,
      :allow_anonymous_participation,
      :survey_embed_url,
      :survey_service,
      :voting_method,
      :voting_max_total,
      :voting_min_total,
      :voting_max_votes_per_idea,
      :document_annotation_embed_url,
      :presentation_mode,
      :poll_anonymous,
      :ideas_order,
      :input_term,
      :include_all_areas,
      {
        admin_publication_attributes: [:publication_status],
        title_multiloc: CL2_SUPPORTED_LOCALES,
        description_multiloc: CL2_SUPPORTED_LOCALES,
        description_preview_multiloc: CL2_SUPPORTED_LOCALES,
        voting_term_singular_multiloc: CL2_SUPPORTED_LOCALES,
        voting_term_plural_multiloc: CL2_SUPPORTED_LOCALES,
        area_ids: [],
        topic_ids: []
      }
    ]

    if AppConfiguration.instance.feature_activated? 'disable_disliking'
      shared += %i[reacting_dislike_enabled reacting_dislike_method reacting_dislike_limited_max]
    end
    shared
  end

  def permitted_attributes_for_create
    attrs = shared_permitted_attributes
    attrs.unshift(:process_type)
  end

  def permitted_attributes_for_update
    shared_permitted_attributes
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end

  def active_moderator?
    return unless active?

    UserRoleService.new.can_moderate_project? record, user
  end
end

ProjectPolicy.prepend(Polls::Patches::ProjectPolicy)
ProjectPolicy.prepend(IdeaAssignment::Patches::ProjectPolicy)
