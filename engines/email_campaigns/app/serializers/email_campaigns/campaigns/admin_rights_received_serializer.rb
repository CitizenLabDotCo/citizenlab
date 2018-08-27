module EmailCampaigns::Campaigns
  class AdminRightsReceivedSerializer < NotificationSerializer
    belongs_to :initiating_user, serializer: CustomUserSerializer
  end
end