class WebApi::V1::AdminPublicationSerializer < WebApi::V1::BaseSerializer
  attributes :parent_id, :ordering, :publication_status, :children_count

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

  belongs_to :publication, polymorphic: true
end