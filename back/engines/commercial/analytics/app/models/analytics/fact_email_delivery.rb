# frozen_string_literal: true

module Analytics
  class FactEmailDelivery < Analytics::ApplicationRecordView
    self.primary_key = :id

    attribute :id, :string
    attribute :dimension_date_sent_id, :date
    attribute :campaign_id, :string
    attribute :dimension_project_id, :string
    attribute :automated, :boolean

    belongs_to :dimension_date_sent, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_project, class_name: 'Analytics::DimensionProject', optional: true

    backed_by_query <<~SQL.squish
      SELECT
        ecd.id,
        ecd.sent_at::DATE AS dimension_date_sent_id,
        ecd.campaign_id,
        p.id AS dimension_project_id,
        ecc.type NOT IN ('EmailCampaigns::Campaigns::Manual', 'EmailCampaigns::Campaigns::ManualProjectParticipants') AS automated
      FROM email_campaigns_deliveries ecd
      INNER JOIN email_campaigns_campaigns ecc ON ecc.id = ecd.campaign_id
      LEFT JOIN projects p ON p.id = ecc.context_id
    SQL
  end
end
