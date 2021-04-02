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
      resolve_for_admin
        .or resolve_for_visitor
    end

    def moderatable
      if user&.admin?
        scope.all
      elsif user
        scope.where(id: user.moderatable_project_ids)
      else
        scope.none
      end
    end

    private

    def resolve_for_admin
      user&.admin? ? scope : scope.none
    end

    # Filter the scope for a user that is not logged in.
    def resolve_for_visitor
      scope.not_draft
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
      record.admin_publication.publication_status == 'draft' ? scope.admin : scope.all
    end
  end

  def index_xlsx?
    moderate?
  end

  def create?
    active? && admin?
  end

  def show?
    moderate? || show_to_non_moderators?
  end

  def by_slug?
    show?
  end

  def update?
    moderate?
  end

  def reorder?
    update?
  end

  def destroy?
    active? && admin?
  end

  def shared_permitted_attributes
    shared = [
      :slug,
      :header_bg,
      :participation_method,
      :posting_enabled,
      :commenting_enabled,
      :voting_enabled,
      :voting_method,
      :voting_limited_max,
      :survey_embed_url,
      :survey_service,
      :max_budget,
      :presentation_mode,
      :poll_anonymous,
      :ideas_order,
      :input_term,
      {
        admin_publication_attributes: [:publication_status],
        title_multiloc: CL2_SUPPORTED_LOCALES,
        description_multiloc: CL2_SUPPORTED_LOCALES,
        description_preview_multiloc: CL2_SUPPORTED_LOCALES,
        area_ids: []
      }
    ]

    shared += [:downvoting_enabled] if AppConfiguration.instance.feature_activated? 'disable_downvoting'
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

  # Helper method that is not part of the pundit conventions but is used
  # publicly
  def moderate?
    return unless active?

    moderate_for_active?
  end

  private

  def moderate_for_active?
    admin?
  end

  def show_to_non_moderators?
    %w[published archived].include?(record.admin_publication.publication_status)
  end
end

ProjectPolicy.prepend_if_ee('IdeaAssignment::Patches::ProjectPolicy')
ProjectPolicy.prepend_if_ee('ProjectFolders::Patches::ProjectPolicy')
ProjectPolicy.prepend_if_ee('ProjectPermissions::Patches::ProjectPolicy')
