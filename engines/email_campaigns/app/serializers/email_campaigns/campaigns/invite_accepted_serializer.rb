module EmailCampaigns::Campaigns
	class InviteAcceptedSerializer < NotificationSerializer
	  belongs_to :initiating_user, record_type: :user, serializer: CustomUserSerializer
	  belongs_to :invite, serializer: CustomInviteSerializer
	end
end