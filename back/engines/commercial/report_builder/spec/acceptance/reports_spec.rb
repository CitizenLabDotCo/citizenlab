# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Reports' do
  explanation 'Customizable reports'

  header 'Content-Type', 'application/json'

  # Shared parameter descriptions
  name_param_desc = 'The name of the report.'
  craftjs_jsonmultiloc_param_desc = 'The craftjs layout configuration, as a multiloc string.'

  get 'web_api/v1/reports' do
    let_it_be(:reports) { create_list(:report, 3) }

    describe 'when authorized' do
      before { admin_header_token }

      example_request 'List all reports' do
        assert_status 200
        expect(response_ids).to match_array(reports.pluck(:id))

        # Layouts are not included when getting a collection of records.
        expect(json_response_body[:included]).to be_nil
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
            name: report.name,
            created_at: report.created_at.iso8601(3),
            updated_at: report.updated_at.iso8601(3)
          },
          relationships: {
            layout: { data: { id: layout.id, type: 'content_builder_layout' } },
            owner: { data: { id: report.owner_id, type: 'user' } }
          }
        )

        included = json_response_body[:included]
        expect(included.length).to eq(1)

        included_layout = included.first
        expect(included_layout).to match(
          id: layout.id,
          type: 'content_builder_layout',
          attributes: hash_including(enabled: true, code: 'report', craftjs_jsonmultiloc: {})
        )
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end

  post 'web_api/v1/reports' do
    parameter :name, name_param_desc, scope: :report, required: true
    parameter :craftjs_jsonmultiloc, craftjs_jsonmultiloc_param_desc, scope: %i[report layout]

    let(:name) { 'my-report' }
    let(:craftjs_jsonmultiloc) do
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
            name: name,
            created_at: be_a(String),
            updated_at: be_a(String)
          },
          relationships: {
            layout: { data: { id: be_a(String), type: 'content_builder_layout' } },
            owner: { data: { id: be_a(String), type: 'user' } }
          }
        )

        layout_id = response_data.dig(:relationships, :layout, :data, :id)
        expect(json_response_body[:included].pluck(:id)).to include(layout_id)

        report = ReportBuilder::Report.find(response_data[:id])
        expect(report.layout.enabled).to be(true)
        expect(report.layout.code).to eq('report')
        expect(report.owner_id).to eq(user.id)
      end

      example '[error] Create a report without name' do
        do_request(report: { name: '' })
        assert_status 422
        expect(json_response_body).to eq({ errors: { name: [{ error: 'blank' }] } })
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
          do_request(report: { name: nil })

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
    parameter :craftjs_jsonmultiloc, craftjs_jsonmultiloc_param_desc, scope: %i[report layout]

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
      end

      describe 'updating the layout of a report' do
        let(:craftjs_jsonmultiloc) do
          { 'nl-BE' => { 'ROOT' => {
            'type' => { 'resolvedName' => 'Container' }
          } } }
        end

        example 'Layout successfully updates by report id' do
          do_request
          assert_status 200
          expect(report.reload.layout.craftjs_jsonmultiloc).to match(
            craftjs_jsonmultiloc
          )
        end
      end

      describe 'reject layouts with more than one locale when updating a report' do
        let(:craftjs_jsonmultiloc) do
          {
            'fr-BE' => { 'ROOT' => { 'type' => { 'resolvedName' => 'Container' } } },
            'nl-BE' => { 'ROOT' => { 'type' => { 'resolvedName' => 'Container' } } }
          }
        end

        example 'Error if more than one locale' do
          do_request
          assert_status 422
          expect(report.reload.layout.craftjs_jsonmultiloc).to match({})
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
          do_request(report: { name: nil })

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
