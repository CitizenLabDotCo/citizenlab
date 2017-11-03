class Api::V1::External::Notifications::MentionInCommentSerializer < Api::V1::External::Notifications::NotificationSerializer
  class CustomCommentSerializer < ActiveModel::Serializer
    attributes :id, :body_multiloc, :upvotes_count, :downvotes_count
  end

  belongs_to :comment, serializer: CustomCommentSerializer

end