class IdeaPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end

  def images_index?
    show?
  end

  def create?
    record.draft? || user
  end

  def show?
    true
  end

  def update?
    record.draft? || (user && (record.author_id == user.id || user.admin?))
  end

  def destroy?
    update?
  end

  def permitted_attributes
    shared = [:publication_status,
      :project_id,
      :author_id,
      :location_description,
      location_point_geojson: [:type, coordinates: []],
      title_multiloc: [:en, :nl, :fr],
      body_multiloc: [:en, :nl, :fr],
      topic_ids: [],
      area_ids: []
    ]
    if user&.admin?
      [:idea_status_id] + shared
    else
      shared
    end
  end


end
