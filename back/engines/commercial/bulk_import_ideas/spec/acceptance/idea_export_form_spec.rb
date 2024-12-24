# frozen_string_literal: true

require 'rails_helper'

resource 'Idea form exports' do
  get 'web_api/v1/phases/:phase_id/importer/export_form/:model/:format' do
    parameter(:phase_id, 'ID of the phase.')
    parameter(:locale, 'Locale of the downloaded form.')

    let(:model) { 'idea' }
    let(:locale) { 'en' }
    let(:phase_id) { project.phases.first.id }

    context 'when not authorized' do
      let(:project) { create(:project_with_active_ideation_phase) }
      let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

      context 'XLSX download' do
        let(:format) { 'xlsx' }

        example 'Get the example xlsx for a project', document: false do
          do_request
          assert_status 401
        end
      end

      context 'PDF download' do
        let(:format) { 'pdf' }

        example 'Get a pdf version of the idea form', document: false do
          do_request
          assert_status 401
        end
      end
    end

    context 'when admin' do
      before do
        admin_header_token
      end

      context 'in an ideation phase with form fields' do
        let(:project) { create(:project_with_active_ideation_phase) }
        let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
        let!(:custom_field) { create(:custom_field, resource: custom_form) }

        context 'PDF download' do
          let(:format) { 'pdf' }

          example 'Get a pdf version of the idea form', document: false do
            do_request
            assert_status 200
          end
        end

        context 'XLSX download' do
          let(:format) { 'xlsx' }

          example_request 'Get the example xlsx for a project' do
            assert_status 200
          end
        end
      end

      context 'in an active native survey phase with form fields' do
        let(:project) { create(:project_with_active_native_survey_phase) }
        let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
        let!(:custom_field) { create(:custom_field, resource: custom_form) }

        context 'PDF download' do
          let(:format) { 'pdf' }

          example 'Get a pdf version of the idea form', document: false do
            do_request
            assert_status 200
          end
        end

        context 'XLSX download' do
          let(:format) { 'xlsx' }

          example_request 'Get the example xlsx for a project' do
            assert_status 200
          end
        end
      end

      context 'in an active proposals phase with form fields' do
        let(:project) { create(:single_phase_proposals_project) }
        let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
        let!(:custom_field) { create(:custom_field, resource: custom_form) }

        context 'PDF download' do
          let(:format) { 'pdf' }

          example 'Get a pdf version of the idea form', document: false do
            do_request
            assert_status 200
          end
        end

        context 'XLSX download' do
          let(:format) { 'xlsx' }

          example_request 'Get the example xlsx for a project' do
            assert_status 200
          end
        end
      end
    end
  end
end
