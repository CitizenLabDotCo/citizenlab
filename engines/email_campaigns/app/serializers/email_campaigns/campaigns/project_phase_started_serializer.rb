module EmailCampaigns::Campaigns
  class ProjectPhaseStartedSerializer < NotificationSerializer
    has_many :phase, serializer: CustomPhaseSerializer
    belongs_to :project, serializer: CustomProjectSerializer
    has_many :project_images, serializer: CustomImageSerializer

  end
end