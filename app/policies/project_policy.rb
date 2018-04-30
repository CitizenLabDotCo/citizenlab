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
      else
        result = scope.where(publication_status: ['published', 'archived'])
        if user
          result
            .distinct
            .left_outer_joins(groups: :memberships)
            .where("projects.visible_to = 'public' OR \
              (projects.visible_to = 'groups' AND memberships.user_id = ?)", user&.id)
        else
          result.where(visible_to: 'public')
        end
      end
    end

    def moderatable
      if user&.admin?
        scope.all
      elsif user
        moderatable_project_ids = user.roles
          .select{|role| role['type'] == 'project_moderator'}
          .map{|role| role['project_id']}.compact
        scope.where(id: moderatable_project_ids)
      else
        []
      end
    end
  end


  def create?
    user&.active? && user.admin?
  end

  def images_index?
    show?
  end

  def files_index?
    show?
  end

  def show?
    user&.admin? || (
      %w(published archived).include?(record.publication_status) && (
        record.visible_to == 'public' || (
          record.visible_to == 'groups' && 
          record.groups.includes(:memberships).flat_map(&:memberships).any?{|m| m.user_id == user.id}
        )
      )
    )
  end

  def by_slug?
    show?
  end

  def update?
    user&.active? && (user.admin? || user.project_moderator?(record.id))
  end

  def reorder?
    update?
  end

  def destroy?
    update?
  end

  def shared_permitted_attributes
    [
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
      :presentation_mode,
      :publication_status,
      title_multiloc: I18n.available_locales, 
      description_multiloc: I18n.available_locales,
      description_preview_multiloc: I18n.available_locales,
      area_ids: [],
      topic_ids: []
    ]
  end

  def permitted_attributes_for_create
    attrs = shared_permitted_attributes
    attrs.unshift(:process_type)
    attrs
  end

  def permitted_attributes_for_update
    attrs = shared_permitted_attributes
    attrs
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
