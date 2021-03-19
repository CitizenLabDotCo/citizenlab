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

  attribute :visible_children_count do |object, params|
    if params.key? :visible_children_count_by_parent_id
      params.dig(:visible_children_count_by_parent_id, object.id) || 0
    else
      Pundit.policy_scope(current_user(params), Project).where(id: object.children.map(&:publication_id)).count
    end
  end

  belongs_to :publication, polymorphic: true
  belongs_to :parent, record_type: :admin_publication

  has_many :children, record_type: :admin_publication
end
<<<<<<< HEAD
=======

WebApi::V1::AdminPublicationSerializer.include_if_ee('ProjectVisibility::Patches::WebApi::V1::AdminPublicationSerializer')
>>>>>>> 4982a269decde0c8b6fa514afdd126b2d28129dd
