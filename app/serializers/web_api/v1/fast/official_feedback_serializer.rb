class WebApi::V1::Fast::OfficialFeedbackSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :body_multiloc, :author_multiloc, :created_at, :updated_at

  belongs_to :idea
  belongs_to :user

end
