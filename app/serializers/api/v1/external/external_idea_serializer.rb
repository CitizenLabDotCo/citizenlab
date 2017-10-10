class Api::V1::External::ExternalIdeaSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :author_name, :upvotes_count, :downvotes_count, :published_at
end
