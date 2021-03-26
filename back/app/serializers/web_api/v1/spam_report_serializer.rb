class WebApi::V1::SpamReportSerializer < WebApi::V1::BaseSerializer
  attributes :reason_code, :other_reason, :reported_at

  belongs_to :spam_reportable, polymorphic: true
  belongs_to :user
end
