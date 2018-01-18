class ProjectPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      resolving_scope = scope
      if !(user && user.admin?)
        resolving_scope = scope.where(publication_status: 'published')
      end
      if user&.admin?
        resolving_scope.all
      elsif user
        resolving_scope
          .left_outer_joins(groups: :memberships)
          .where("projects.visible_to = 'public' OR \
            (projects.visible_to = 'groups' AND memberships.user_id = ?)", user&.id)
      else
        resolving_scope
          .where(visible_to: 'public')
      end
    end
  end

  def create?
    user && user.admin?
  end

  def images_index?
    show?
  end

  def files_index?
    show?
  end

  def show?
    user&.admin? ||
    (record.publication_status == 'published' &&
     (record.visible_to == 'public' || 
      record.visible_to == 'groups' && record.groups.includes(:memberships).flat_map(&:memberships).any?{|m| m.user_id == user.id}))
  end

  def by_slug?
    show?
  end

  def update?
    user && (user.admin? || user.project_moderator?(record.id))
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
end
