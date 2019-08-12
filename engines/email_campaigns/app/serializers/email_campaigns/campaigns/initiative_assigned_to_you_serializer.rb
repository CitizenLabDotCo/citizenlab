module EmailCampaigns::Campaigns
  class InitiativeAssignedToYouSerializer < NotificationSerializer
	  belongs_to :initiating_user, serializer: CustomUserSerializer
	  belongs_to :initiative, serializer: CustomInitiativeSerializer
	  belongs_to :initiative_author, serializer: CustomUserSerializer
	  has_many :initiative_images, serializer: CustomImageSerializer
	  has_many :initiative_topics, serializer: ::WebApi::V1::External::TopicSerializer
  end
end