# frozen_string_literal: true

class PublicApi::V2::CommentSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :body,
    :author_id,
    :post_id,
    :parent_id,
    :created_at,
    :updated_at,
    :body_updated_at,
    :likes_count,
    :dislikes_count,
    :children_count,
    :publication_status

  attribute(:body) { MultilocService.new.t(object.body_multiloc) }
  attribute(:post_type) { classname_to_type(object.post_type) }
  attribute(:idea_id) { object.post_type == 'Idea' ? object.post&.id : nil }
  attribute(:project_id) { object.post_type == 'Idea' ? object.post&.project_id : nil }
  attribute(:initiative_id) { object.post_type == 'Initiative' ? object.post&.id : nil }
end
