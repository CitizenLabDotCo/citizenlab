# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_reports
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  owner_id   :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_report_builder_reports_on_name      (name) UNIQUE
#  index_report_builder_reports_on_owner_id  (owner_id)
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
    accepts_nested_attributes_for :layout, reject_if: :multiple_locales

    validates :name, presence: true, uniqueness: true

    # First version of report builder only allows saving of one locale
    def multiple_locales(attributes)
      locales = attributes['craftjs_jsonmultiloc']
      locales.keys.length > 1
    end

  end


end
