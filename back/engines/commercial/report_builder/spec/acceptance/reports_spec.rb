# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Reports' do
  explanation 'Customizable reports'

  header 'Content-Type', 'application/json'

  # Shared parameter descriptions
  name_param_desc = 'The name of the report.'
  craftjs_json_param_desc = 'The craftjs layout configuration.'

  get 'web_api/v1/reports' do
    parameter :owner_id, 'Filter reports by owner id(s).', required: false
    parameter :search, 'Search reports by name.', required: false
    parameter :service, 'Filter only the reports from super admins or non-super admins.', required: false

    let_it_be(:reports) { create_list(:report, 3) }

    describe 'when authorized' do
      before { admin_header_token }

      example_request 'List all reports' do
        assert_status 200
        expect(response_ids).to match_array(reports.pluck(:id))

        # Layouts are not included when getting a collection of records.
        expect(json_response_body[:included]).to be_nil
      end

      example 'Search reports by owner' do
        report = reports.first
        owner_id = report.owner_id

        do_request(owner_id: owner_id)
        assert_status 200

        expect(response_ids).to match [report.id]
      end

      example 'Search reports by owners' do
        expected_reports = reports.take(2)
        owner_ids = expected_reports.pluck(:owner_id)

        do_request(owner_id: owner_ids)

        assert_status 200
        expect(response_ids).to match_array(expected_reports.pluck(:id))
      end

      example 'Search by name' do
        report = create(:report, name: 'lemon opera sky')
        query = 'lem sky' # prefix search is enabled

        do_request(search: query)

        assert_status 200
        expect(response_ids).to match [report.id]
      end

      example 'Search by name (no results)' do
        query = 'opera sky'

        do_request(search: query)

        assert_status 200
        expect(response_data).to be_empty
      end

      example 'Get only the reports from super admins (service reports)' do
        super_admin = create(:super_admin)
        service_report = create(:report, owner: super_admin)

        do_request(service: true)

        assert_status 200
        expect(response_ids).to match [service_report.id]
      end

      example 'Get only the reports from non-super admins' do
        super_admin = create(:super_admin)
        _service_report = create(:report, owner: super_admin)

        do_request(service: false)

        assert_status 200
        expect(response_ids).to match_array(reports.pluck(:id))
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end

  get 'web_api/v1/reports/:id' do
    let_it_be(:report) { create(:report) }
    let(:layout) { report.layout }
    let(:id) { report.id }

    describe 'when authorized' do
      before { admin_header_token }

      example_request 'Get one report by id' do
        assert_status 200

        expect(response_data).to match(
          id: report.id,
          type: 'report',
          attributes: {
            action_descriptor: {
              editing_report: {
                enabled: true,
                disabled_reason: nil
              }
            },
            name: report.name,
            created_at: report.created_at.iso8601(3),
            updated_at: report.updated_at.iso8601(3),
            visible: true
          },
          relationships: {
            layout: { data: { id: layout.id, type: 'content_builder_layout' } },
            owner: { data: { id: report.owner_id, type: 'user' } },
            phase: { data: nil }
          }
        )

        included = json_response_body[:included]
        expect(included.length).to eq(1)

        included_layout = included.first
        expect(included_layout).to match(
          id: layout.id,
          type: 'content_builder_layout',
          attributes: hash_including(enabled: true, code: 'report', craftjs_json: {})
        )
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end

  post 'web_api/v1/reports' do
    parameter :name, name_param_desc, scope: :report, required: false
    parameter :craftjs_json, craftjs_json_param_desc, scope: %i[report layout]

    let(:name) { 'my-report' }
    let(:craftjs_json) do
      {
        'nl-BE': {
          ROOT: { type: { resolvedName: 'Container' } }
        }
      }
    end

    describe 'when authorized' do
      let(:user) { create(:admin) }

      before { header_token_for user }

      example 'Create a report' do
        do_request
        assert_status 201

        expect(response_data).to match(
          id: be_a(String),
          type: 'report',
          attributes: {
            action_descriptor: {
              editing_report: {
                enabled: true,
                disabled_reason: nil
              }
            },
            name: name,
            created_at: be_a(String),
            updated_at: be_a(String),
            visible: false
          },
          relationships: {
            layout: { data: { id: be_a(String), type: 'content_builder_layout' } },
            owner: { data: { id: be_a(String), type: 'user' } },
            phase: { data: nil }
          }
        )

        layout_id = response_data.dig(:relationships, :layout, :data, :id)
        expect(json_response_body[:included].pluck(:id)).to include(layout_id)

        report = ReportBuilder::Report.find(response_data[:id])
        expect(report.layout.enabled).to be(true)
        expect(report.layout.code).to eq('report')
        expect(report.owner_id).to eq(user.id)
      end

      context 'when the report belongs to a phase' do
        parameter :phase_id, 'The id of the phase the report belongs to.', required: false, scope: :report

        before { @phase = create(:phase) }

        let(:phase_id) { @phase.id }

        example_request 'Create a phase report' do
          assert_status 201

          report = ReportBuilder::Report.find(response_data[:id])
          expect(report.phase_id).to eq(@phase.id)
        end
      end

      context 'when the report cannot be saved (e.g., if name is duplicated)' do
        before do
          create(:report, name: name)
        end

        example_request '[error] Does not create the report' do
          assert_status 422
          expect(ReportBuilder::Report.count).to eq(1)
        end
      end

      describe 'side effects', document: false do
        let(:side_fx_service) do
          instance_spy(ReportBuilder::SideFxReportService, 'side_fx_service')
        end

        before do
          allow_any_instance_of(ReportBuilder::WebApi::V1::ReportsController)
            .to receive(:side_fx_service).and_return(side_fx_service)
        end

        example 'runs the before/after_create hooks when the report is successfully created' do
          do_request

          expect(side_fx_service).to have_received(:before_create)
          expect(side_fx_service).to have_received(:after_create)
        end

        example 'only runs the before_create hook when the report creation fails' do
          name = 'Report 1'
          create(:report, name: name)
          do_request(report: { name: name })

          expect(side_fx_service).to have_received(:before_create)
          expect(side_fx_service).not_to have_received(:after_create)
        end
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end

  patch 'web_api/v1/reports/:id' do
    parameter :name, name_param_desc, scope: :report
    parameter :craftjs_json, craftjs_json_param_desc, scope: %i[report layout]

    let_it_be(:report) { create(:report) }
    let(:id) { report.id }

    describe 'when authorized' do
      before { admin_header_token }

      describe 'updating the name of a report' do
        let(:name) { "#{report.name}-new" }

        example_request 'Update the name of a report by id' do
          assert_status 200
          expect(report.reload.name).to eq(name)
        end

        example '[error] Update a report that do not exist' do
          do_request(id: 'do-not-exist')
          assert_status 404
        end

        context 'when the report cannot be saved (e.g., if name is duplicated)' do
          before do
            create(:report, name: name)
          end

          example_request '[error] Does not update the report' do
            assert_status 422
            expect(report).not_to eq(name)
          end
        end
      end

      describe 'updating the layout of a report' do
        let(:craftjs_json) do
          { 'ROOT' => { 'type' => { 'resolvedName' => 'Container' } } }
        end

        example 'Layout successfully updates by report id' do
          do_request
          assert_status 200
          expect(report.reload.layout.craftjs_json).to match(
            craftjs_json
          )
        end
      end

      describe 'updating the visibility of a report' do
        example 'Visibility successfully updates by report id' do
          expect(report.reload.visible).to be(true)
          do_request(report: { visible: false })
          assert_status 200
          expect(report.reload.visible).to be(false)
        end
      end

      describe 'side effects', document: false do
        let(:side_fx_service) do
          instance_spy(ReportBuilder::SideFxReportService, 'side_fx_service')
        end

        before do
          allow_any_instance_of(ReportBuilder::WebApi::V1::ReportsController)
            .to receive(:side_fx_service).and_return(side_fx_service)
        end

        example 'runs the before/after_update hooks when the report is successfully updated' do
          do_request(report: { name: 'better-name' })

          expect(side_fx_service).to have_received(:before_update)
          expect(side_fx_service).to have_received(:after_update)
        end

        example 'only runs the before_update hook when the report update fails' do
          name = 'Report 1'
          create(:report, name: name)
          do_request(report: { name: name })

          expect(side_fx_service).to have_received(:before_update)
          expect(side_fx_service).not_to have_received(:after_update)
        end
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end

  delete 'web_api/v1/reports/:id' do
    let_it_be(:report) { create(:report) }
    let(:id) { report.id }

    describe 'when authorized' do
      before { admin_header_token }

      example_request 'Delete one report by id' do
        assert_status 204
        expect { ReportBuilder::Report.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      describe 'side effects', document: false do
        let(:side_fx_service) do
          instance_spy(ReportBuilder::SideFxReportService, 'side_fx_service')
        end

        before do
          allow_any_instance_of(ReportBuilder::WebApi::V1::ReportsController)
            .to receive(:side_fx_service).and_return(side_fx_service)
        end

        example 'runs the before/after_destroy hooks when the report is successfully deleted' do
          do_request

          expect(side_fx_service).to have_received(:before_destroy)
          expect(side_fx_service).to have_received(:after_destroy)
        end

        example 'only runs the before_destroy hook when the report deletion fails' do
          allow_any_instance_of(ReportBuilder::Report).to receive(:destroy).and_return(false)

          do_request

          expect(side_fx_service).to have_received(:before_destroy)
          expect(side_fx_service).not_to have_received(:after_destroy)
        end
      end
    end

    example '[error] Delete a report that do not exist' do
      do_request(id: 'do-not-exist')
      assert_status 404
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end
end
