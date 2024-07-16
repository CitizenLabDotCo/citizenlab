# frozen_string_literal: true

module ReportBuilder::Patches::User
  def self.included(base)
    base.class_eval do
      has_many :reports, class_name: 'ReportBuilder::Report', foreign_key: 'owner_id', dependent: :nullify
    end
  end
end
