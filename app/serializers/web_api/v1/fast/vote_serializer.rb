class WebApi::V1::Fast::VoteSerializer
  include FastJsonapi::ObjectSerializer

  attributes :id, :mode

  belongs_to :votable, polymorphic: true
  belongs_to :user
end
