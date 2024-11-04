# frozen_string_literal: true

class WebApi::V1::AdminPublicationSerializer < WebApi::V1::BaseSerializer
  attributes :ordering, :publication_status, :depth

  attribute :publication_title_multiloc do |object|
    object.publication.title_multiloc
  end

  attribute :publication_description_multiloc do |object|
    object.publication.description_multiloc
  end

  attribute :publication_description_preview_multiloc do |object|
    object.publication.description_preview_multiloc
  end

  attribute :publication_slug do |object|
    object.publication.slug
  end

  attribute :publication_visible_to, if: proc { |object|
    object.publication.respond_to?(:visible_to)
  } do |object|
    object.publication.visible_to
  end

  attribute :visible_children_count do |object, params|
    if params.key? :visible_children_count_by_parent_id
      params.dig(:visible_children_count_by_parent_id, object.id) || 0
    else
      Pundit.policy_scope(user_context(params), Project).where(id: object.children.map(&:publication_id)).count
    end
  end

  belongs_to :publication, polymorphic: true
  belongs_to :parent, record_type: :admin_publication, serializer: :admin_publication

  has_many :children, record_type: :admin_publication, serializer: :admin_publication
end
