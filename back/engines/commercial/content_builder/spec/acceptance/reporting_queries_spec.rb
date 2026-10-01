# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ReportingQueries' do
  explanation <<~DESC
    Answers the query behind one generated chart.

    A report is a picture of a moment: the first time a question is asked of a layout
    the answer is stored, and every later read returns that stored answer. Only an
    admin can fill a snapshot, so no reader ever causes SQL to run.
  DESC

  before do
    set_api_content_type
    SettingsService.new.activate_feature!('llm_reporting')

    # Execution belongs to McpServer::ReportingQueryRunner and is specced there. Here
    # the subject is what surrounds it: which answers are stored, which are re-used,
    # and who is allowed to cause one. Validation stays real, because normalising the
    # SQL is what decides whether two questions are the same question.
    allow(McpServer::ReportingQueryRunner).to receive(:run) do |query|
      McpServer::ReportingQueryRunner.validate!(query)
      McpServer::ReportingQueryRunner::Result.new(
        columns: ['contributions'], rows: [{ 'contributions' => 42 }], truncated: false
      )
    end
  end

  let(:layout) { create(:layout) }
  let(:sql) { 'SELECT count(*) AS contributions FROM reporting_contributions' }

  post 'web_api/v1/reporting_queries' do
    parameter :query, 'A single SELECT over the reporting views.', required: true
    parameter :layout_id, 'The layout the question belongs to. Without it the query runs live.'
    parameter :reporting_token, 'A scoped token, for the check service rendering a block.'

    let(:query) { sql }
    let(:layout_id) { layout.id }

    context 'when admin' do
      before { admin_header_token }

      example 'Run a query and store the answer against the layout' do
        do_request(query: sql, layout_id: layout.id)

        assert_status 200
        expect(response_data[:attributes][:columns]).to eq ['contributions']
        expect(response_data[:attributes][:rows]).to eq [{ contributions: 42 }]
        expect(response_data[:attributes][:snapshot]).to be true
        expect(layout.query_snapshots.count).to eq 1
      end

      example 'Answer a repeated question from the stored answer', document: false do
        do_request(query: sql, layout_id: layout.id)
        stored = layout.query_snapshots.sole

        # A second ask must not execute again, or the report would move under the admin.
        expect(McpServer::ReportingQueryRunner).not_to receive(:run)
        do_request(query: sql, layout_id: layout.id)

        assert_status 200
        expect(response_data[:attributes][:snapshot]).to be true
        expect(layout.query_snapshots.sole.id).to eq stored.id
      end

      example 'Whitespace does not fork a stored answer', document: false do
        do_request(query: sql, layout_id: layout.id)
        do_request(query: "SELECT   count(*)   AS contributions\nFROM reporting_contributions", layout_id: layout.id)

        expect(layout.query_snapshots.count).to eq 1
      end

      example 'Run a query live when it belongs to no layout', document: false do
        do_request(query: sql, layout_id: nil)

        assert_status 200
        expect(response_data[:attributes][:snapshot]).to be false
        expect(ContentBuilder::QuerySnapshot.count).to eq 0
      end

      example '[error] Try to run a query the sandbox refuses', document: false do
        do_request(query: 'SELECT email FROM users', layout_id: layout.id)

        assert_status 422
        expect(json_response_body[:errors][:query].first[:error]).to eq 'rejected'
      end
    end

    context 'when visitor' do
      example 'Read the stored answer of a layout' do
        create(
          :query_snapshot,
          layout: layout,
          sql: McpServer::SqlSandboxer.validate(sql).normalized_sql,
          data: { 'columns' => ['contributions'], 'rows' => [{ 'contributions' => 7 }], 'truncated' => false }
        )

        do_request(query: sql, layout_id: layout.id)

        assert_status 200
        expect(response_data[:attributes][:rows]).to eq [{ contributions: 7 }]
        expect(response_data[:attributes][:snapshot]).to be true
      end

      # The whole point of storing answers: a reader is served one or served nothing.
      example '[error] Try to make a query run that was never stored' do
        do_request(query: sql, layout_id: layout.id)

        assert_status 401
        expect(ContentBuilder::QuerySnapshot.count).to eq 0
      end

      example '[error] Try to run a query with no layout at all', document: false do
        do_request(query: sql, layout_id: nil)

        assert_status 401
      end
    end

    context 'when the check service renders a block' do
      # The browser in the check service has no session: it holds a token good for
      # one layout's data and nothing else.
      let(:token) do
        ContentBuilder::ScopedReportingToken.mint(layout_id: layout.id, user_id: create(:admin).id)
      end

      example 'Run a query with a scoped token' do
        do_request(query: sql, layout_id: layout.id, reporting_token: token)

        assert_status 200
        expect(response_data[:attributes][:snapshot]).to be true
        expect(layout.query_snapshots.count).to eq 1
      end

      example '[error] Try to read another layout with it', document: false do
        other = create(:layout)

        do_request(query: sql, layout_id: other.id, reporting_token: token)

        assert_status 401
        expect(other.query_snapshots.count).to eq 0
      end
    end
  end

  post 'web_api/v1/content_builder_layouts/:layout_id/refresh_snapshots' do
    let(:layout_id) { layout.id }
    let!(:snapshot) do
      create(
        :query_snapshot,
        layout: layout,
        sql: McpServer::SqlSandboxer.validate(sql).normalized_sql,
        data: { 'columns' => ['contributions'], 'rows' => [{ 'contributions' => 0 }], 'truncated' => false },
        executed_at: 1.week.ago
      )
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'Replace every stored answer the layout holds' do
        assert_status 200
        expect(response_data[:attributes][:refreshed]).to eq 1
        expect(snapshot.reload.executed_at).to be > 1.minute.ago
      end
    end

    context 'when visitor' do
      example_request '[error] Try to refresh without authorization' do
        assert_status 401
        expect(snapshot.reload.executed_at).to be < 1.minute.ago
      end
    end
  end
end
