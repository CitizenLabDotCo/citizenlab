class WebApi::V1::VoteSerializer < WebApi::V1::BaseSerializer
  attributes :mode

  belongs_to :votable, polymorphic: true
end
