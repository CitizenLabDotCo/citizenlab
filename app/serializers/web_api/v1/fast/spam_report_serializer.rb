class WebApi::V1::Fast::SpamReportSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :reason_code, :other_reason, :reported_at

  belongs_to :spam_reportable, polymorphic: true
  belongs_to :user
end
