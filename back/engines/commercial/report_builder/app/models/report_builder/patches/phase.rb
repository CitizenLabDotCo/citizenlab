# frozen_string_literal: true

module ReportBuilder::Patches::Phase
  def self.included(base)
    base.class_eval do
      has_one :report, class_name: 'ReportBuilder::Report', dependent: :destroy
    end
  end
end
