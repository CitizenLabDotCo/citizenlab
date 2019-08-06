module EmailCampaigns::Campaigns
	class InitiativeMarkedAsSpamSerializer < NotificationSerializer
	  belongs_to :initiating_user, serializer: CustomUserSerializer
	  belongs_to :spam_report, serializer: CustomSpamReportSerializer
	  belongs_to :initiative, serializer: CustomInitiativeSerializer
	  has_many :initiative_images, serializer: CustomImageSerializer
	end
end