# frozen_string_literal: true

require 'rails_helper'

# Every reporting view must say how a moderator's query is limited to their
# projects, or be admin only. A view with neither cannot be queried with a project
# scope, so a new view fails here before it fails for a moderator.
RSpec.describe 'Reporting scope rules' do # rubocop:disable RSpec/DescribeClass
  McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES.each do |model|
    describe model.name do
      it 'has a project scope rule, or is admin only' do
        expect(model).to include(Analytics::Reporting::ScopedView)
        expect { model.for_projects([]).to_sql }.not_to raise_error unless model.admin_only?
      end
    end
  end

  it 'makes only the views without a project admin only' do
    admin_only = McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES.select(&:admin_only?)

    expect(admin_only.map(&:table_name))
      .to match_array %w[reporting_staff_activities reporting_invites reporting_registrations]
  end

  it 'fails closed for a view without a rule' do
    view = Class.new(Analytics::ApplicationRecordView) { include Analytics::Reporting::ScopedView }

    expect { view.for_projects([]) }.to raise_error(NotImplementedError)
  end
end
