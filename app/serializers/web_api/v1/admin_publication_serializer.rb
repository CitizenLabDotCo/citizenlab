class WebApi::V1::AdminPublicationSerializer < WebApi::V1::BaseSerializer
  attributes :ordering, :publication_status, :children_count

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

  attribute :visible_children_count do |object, params|
    params.dig(:visible_children_count_by_parent_id, object.id) || Pundit.policy_scope(current_user(params), Project).where(id: object.children.map(&:publication_id)).count
  end

  belongs_to :publication, polymorphic: true
  belongs_to :parent

  has_many :children
end