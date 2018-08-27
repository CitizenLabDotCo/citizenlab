module EmailCampaigns::Campaigns
	class InviteAcceptedSerializer < NotificationSerializer
	  belongs_to :initiating_user, serializer: CustomUserSerializer
	  belongs_to :invite, serializer: ::WebApi::V1::External::InviteSerializer
	end
end