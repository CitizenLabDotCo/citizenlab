class WebApi::V1::OfficialFeedbackSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :author_multiloc, :created_at, :updated_at

  belongs_to :feedback_item
  belongs_to :user

end
