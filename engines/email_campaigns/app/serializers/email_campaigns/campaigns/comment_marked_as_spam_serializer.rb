module EmailCampaigns::Campaigns
	class CommentMarkedAsSpamSerializer < NotificationSerializer
	  belongs_to :initiating_user, record_type: :user, serializer: CustomUserSerializer
	  belongs_to :spam_report, serializer: CustomSpamReportSerializer
	  belongs_to :comment, serializer: CustomCommentSerializer
	  belongs_to :idea, serializer: CustomIdeaSerializer
	  has_many :idea_images, serializer: CustomImageSerializer do |object|
      object.idea.&idea_images
    end
	  belongs_to :project, serializer: CustomProjectSerializer
	  has_many :project_images, serializer: CustomImageSerializer do |object|
      object.project.&project_images
    end
	end
end