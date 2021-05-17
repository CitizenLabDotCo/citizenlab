class ProjectPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope.all
      elsif user&.project_moderator?
        scope.where(id: user.moderatable_project_ids + scope.user_groups_visible(user).or(scope.publicly_visible).ids)
      elsif user
        scope.user_groups_visible(user).not_draft.or(scope.publicly_visible.not_draft)
      else
        scope.publicly_visible.not_draft
      end
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
      if record.visible_to == 'public' && record.admin_publication.publication_status != 'draft'
        scope.all
      elsif record.visible_to == 'groups' && record.admin_publication.publication_status != 'draft'
        scope.in_any_group(record.groups).or(scope.admin).or(scope.project_moderator(record.id))
      else
        scope.admin.or(scope.project_moderator(record.id))
      end
    end
  end


  def index_xlsx?
    moderate?
  end

  def create?
    user&.active? && user.admin?
  end

  def show?
    moderate? || (
      %w(published archived).include?(record.admin_publication.publication_status) && (
        record.visible_to == 'public' || (
          user &&
          record.visible_to == 'groups' &&
          (record.groups.ids & user.group_ids).any?
        )
      )
    )
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
    user&.active? && user.admin?
  end

  def shared_permitted_attributes
    shared = [
      :slug,
      :header_bg,
      :visible_to,
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
      admin_publication_attributes: [:publication_status],
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES,
      description_preview_multiloc: CL2_SUPPORTED_LOCALES,
      area_ids: []
    ]
    shared += [:downvoting_enabled] if AppConfiguration.instance.feature_activated? 'disable_downvoting'
    shared
  end

  def permitted_attributes_for_create
    attrs = shared_permitted_attributes
    attrs.unshift(:process_type)
    attrs
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
    user&.active? && (user.admin? || (record.id && user.project_moderator?(record.id)))
  end
end

ProjectPolicy.prepend_if_ee('ProjectFolders::Patches::ProjectPolicy')
ProjectPolicy::Scope.prepend_if_ee('ProjectFolders::Patches::ProjectPolicy::Scope')
ProjectPolicy.prepend_if_ee('IdeaAssignment::Patches::ProjectPolicy')
ProjectPolicy.prepend('Polls::Patches::ProjectPolicy'.constantize)
