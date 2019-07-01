module EmailCampaigns::Campaigns
	class ProjectModerationRightsReceivedSerializer < NotificationSerializer
	  belongs_to :initiating_user, record_type: :user, serializer: CustomUserSerializer
	  belongs_to :project, serializer: CustomProjectSerializer
	  has_many :project_images, serializer: CustomImageSerializer do |object|
      object.project&.project_images
    end
	end
end