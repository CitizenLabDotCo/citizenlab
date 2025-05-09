# frozen_string_literal: true

require 'rails_helper'

resource 'Idea form exports' do
  get 'web_api/v1/phases/:phase_id/importer/export_form/:model/:format' do
    parameter(:phase_id, 'ID of the phase.')
    parameter(:locale, 'Locale of the downloaded form.')

    let(:model) { 'idea' }
    let(:locale) { 'en' }
    let(:phase_id) { project.phases.first.id }

    # Any user can download all formats (even though the frontend may not support it)
    context 'when not authorized' do
      context 'in an ideation phase with form fields' do
        let(:project) { create(:project_with_active_ideation_phase) }
        let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
        let!(:custom_field) { create(:custom_field, resource: custom_form) }

        context 'PDF download (deprecated version)' do
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

        context 'HTML form (for rendering with other formats)' do
          let(:format) { 'html' }

          example 'Get an HTML version of the idea form for exporting to PDF', document: false do
            do_request
            assert_status 200
          end

          example 'Does not return anything if in production environment', document: false do
            allow(Rails.env).to receive(:production?).and_return(true)
            do_request
            assert_status 404
          end
        end

        context 'PDF rendered from HTML' do
          let(:format) { 'htmlpdf' }

          example 'Get an PDF version of the idea form', document: false do
            # Mock the PDF export to avoid call to Gutenberg
            allow_any_instance_of(BulkImportIdeas::Exporters::IdeaHtmlPdfFormExporter).to receive(:export).and_return(Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_1.pdf').read)
            do_request
            assert_status 200
          end
        end

        context 'Unsupported format' do
          let(:format) { 'unsupported_format' }

          example 'NOT FOUND: unsupported format', document: false do
            do_request
            assert_status 404
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
