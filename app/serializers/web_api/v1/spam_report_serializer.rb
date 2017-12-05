class WebApi::V1::SpamReportSerializer < ActiveModel::Serializer
  attributes :id, :reason_code, :other_reason, :reported_at

  belongs_to :spam_reportable
  belongs_to :user
end
