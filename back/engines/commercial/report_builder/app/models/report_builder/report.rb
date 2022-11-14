# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_reports
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_report_builder_reports_on_name  (name) UNIQUE
#
module ReportBuilder
  class Report < ::ApplicationRecord
    has_one(
      :layout,
      class_name: 'ContentBuilder::Layout', as: :content_buildable,
      dependent: :destroy
    )
    accepts_nested_attributes_for :layout

    validates :name, presence: true, uniqueness: true
  end
end
