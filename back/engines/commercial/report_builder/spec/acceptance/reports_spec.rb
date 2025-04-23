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

      example 'Find community monitor reports' do
        community_monitor_phase = create(:community_monitor_survey_phase)
        settings = AppConfiguration.instance.settings
        settings['community_monitor'] = { 'enabled' => true, 'allowed' => true, 'project_id' => community_monitor_phase.project.id }
        AppConfiguration.instance.update!(settings:)

        report = create(:report, phase: community_monitor_phase)

        do_request(community_monitor: 'true')
        assert_status 200
        expect(response_ids).to eq [report.id]
      end

      example 'Find community monitor reports (community monitor not configured)' do
        do_request(community_monitor: 'true')
        assert_status 200
        expect(response_data).to be_empty
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
            action_descriptors: {
              editing_report: {
                enabled: true,
                disabled_reason: nil
              }
            },
            name: report.name,
            created_at: report.created_at.iso8601(3),
            updated_at: report.updated_at.iso8601(3),
            visible: false,
            year: nil,
            quarter: nil
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

  post 'web_api/v1/reports/:id/copy' do
    route_description <<~DESC
      Copy a report by ID. The owner of the new report will be the current user.
      
      Note on copying phase reports: Report copies are never associated with a phase,
      even if the source report is a phase report. It follows that:
      - The new report is not published (`visible = false`).
      - Graph data units are not copied over. They only make sense in the context of a
        report that can be published.
    DESC

    let_it_be(:report) { create(:report) }
    let(:id) { report.id }

    describe 'when authorized' do
      let(:current_user) { create(:admin) }

      before { header_token_for current_user }

      example_request 'Copy a report by id' do
        assert_status 201

        clone = ReportBuilder::Report.find(response_data[:id])
        expect(clone.name).to eq("#{report.name} (1)")
        expect(clone.owner_id).to eq(current_user.id)
        expect(clone.phase_id).to be_nil
        expect(clone.visible).to be(false)
        expect(clone.layout.craftjs_json).to eq(report.layout.craftjs_json)
      end

      context 'when the report is a phase report with graph data units' do
        let!(:report) do
          create(:published_graph_data_unit).report.tap do |report|
            report.visible = true
            expect(report.phase_id).not_to be_nil
          end
        end

        example 'Copy the report without the graph data units and phase association', document: false do
          expect { do_request }.not_to change(ReportBuilder::PublishedGraphDataUnit, :count)

          clone = ReportBuilder::Report.find(response_data[:id])
          expect(clone.published_graph_data_units).to be_empty
          expect(clone.phase_id).to be_nil
        end
      end

      context 'when the report contains images' do
        let!(:report) { create(:report, :with_image) }

        # @return [void]
        def clear_data_codes(craftjs_json)
          ContentBuilder::LayoutImageService.new.image_elements(craftjs_json).each do |img_elt|
            img_elt['dataCode'] = nil
          end
        end

        example 'Copy the report and its images', document: false do
          expect { do_request }.to change(ContentBuilder::LayoutImage, :count).by(1)

          craftjs_json_orig = report.layout.craftjs_json
          craftjs_json_copy = ContentBuilder::Layout
            .find_by(content_buildable_id: response_data[:id])
            .craftjs_json

          clear_data_codes(craftjs_json_orig)
          clear_data_codes(craftjs_json_copy)

          expect(craftjs_json_copy).to eq(craftjs_json_orig)
        end
      end

      context 'when the report contains references to itself (its own id)' do
        let!(:report) do
          create(:report) do |report|
            report.layout.update!(craftjs_json: {
              'ROOT' => {
                'type' => 'div',
                'nodes' => ['QoSo5wgDlQ'],
                'props' => { 'id' => 'e2e-content-builder-frame' },
                'custom' => {},
                'hidden' => false,
                'isCanvas' => true,
                'displayName' => 'div',
                'linkedNodes' => {}
              },
              'QoSo5wgDlQ' => {
                'type' => { 'resolvedName' => 'DummyAboutReportWidget' },
                'nodes' => [],
                'props' => { 'reportId' => report.id },
                'custom' => {},
                'hidden' => false,
                'parent' => 'ROOT',
                'isCanvas' => false,
                'displayName' => 'DummyAboutReportWidget',
                'linkedNodes' => {}
              }
            })
          end
        end

        example 'Copy the report and update the references', document: false do
          # sanity check
          expect(report.layout.craftjs_json.to_json).to include(report.id)

          do_request

          clone = ReportBuilder::Report.find(response_data[:id])
          expect(clone.layout.craftjs_json.to_json).not_to include(report.id)
          expect(clone.layout.craftjs_json.to_json).to include(clone.id)
        end
      end

      context 'when called multiple times' do
        example 'Create a report copy with a unique name' do
          do_request

          assert_status 201
          copy1 = ReportBuilder::Report.find(response_data[:id])
          expect(copy1.name).to eq("#{report.name} (1)")

          do_request

          assert_status 201
          copy2 = ReportBuilder::Report.find(response_data[:id])
          expect(copy2.name).to eq("#{report.name} (2)")
        end
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end

  post 'web_api/v1/reports' do
    parameter :name, name_param_desc, scope: :report, required: false
    parameter :year, 'Year of report (Community monitor)', scope: :report, required: false
    parameter :quarter, 'Quarter of report (Community monitor)', scope: :report, required: false
    parameter :craftjs_json, craftjs_json_param_desc, scope: %i[report layout]

    let(:name) { 'my-report' }
    let(:quarter) { '1' }
    let(:year) { '2025' }
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
            action_descriptors: {
              editing_report: {
                enabled: true,
                disabled_reason: nil
              }
            },
            name: name,
            created_at: be_a(String),
            updated_at: be_a(String),
            visible: false,
            year: 2025,
            quarter: 1
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
        # only phase reports can be visible
        before { report.update!(phase: create(:phase)) }

        example 'Visibility successfully updates by report id' do
          expect(report.reload.visible).to be(false)
          do_request(report: { visible: true })
          assert_status 200
          expect(report.reload.visible).to be(true)
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
