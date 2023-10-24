# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_reports
#
#  id                         :uuid             not null, primary key
#  name                       :string
#  owner_id                   :uuid             not null
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  participation_context_type :string
#  participation_context_id   :uuid
#
# Indexes
#
#  index_report_builder_reports_on_name                   (name) UNIQUE
#  index_report_builder_reports_on_owner_id               (owner_id)
#  index_report_builder_reports_on_participation_context  (participation_context_type,participation_context_id)
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id)
#
module ReportBuilder
  class Report < ::ApplicationRecord
    belongs_to :owner, class_name: 'User'
    has_one(
      :layout,
      class_name: 'ContentBuilder::Layout', as: :content_buildable,
      dependent: :destroy
    )
    accepts_nested_attributes_for :layout

    scope :with_platform_context, -> { where(participation_context_type: nil) }

    validates :name, uniqueness: true, if: :present?
  end
end
