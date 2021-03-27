module EmailCampaigns
  class CampaignsGroup < ApplicationRecord

    # We're adding optional: true to make the creation of a campaign with
    # associated campaigns_groups succeed. This started failing when we
    # migrated to rails 5.2. The underlying database index will still
    # prevent a null value here.
    belongs_to :campaign, class_name: 'EmailCampaigns::Campaign', optional: true
    belongs_to :group

  end
end