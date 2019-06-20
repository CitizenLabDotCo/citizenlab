class WebApi::V1::Fast::VoteSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :mode

  belongs_to :votable, polymorphic: true
  belongs_to :user
end
