# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project', admin_api: true do
  before do
    header 'Content-Type', 'application/json'
    header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')
  end

  get 'admin_api/projects/:id/template_export' do
    parameter :tenant_id, 'The tenant id from which to export the project', required: true
    with_options scope: :project do
      parameter :include_ideas, "Whether to also include the project's ideas, comments, votes and participants", required: false
      parameter :anonymize_users, 'Generate new first and last name, email etc.', required: false
      parameter :translate_content, 'Translate the content to other languages', required: false
      parameter :shift_timestamps, 'Change the timestamps by the specified number of days', required: false
      parameter :new_slug, 'The new slug for the copied project', required: false
      parameter :new_title_multiloc, 'The new title for the copied project', required: false
      parameter :new_publication_status, "The new publication status for the new project. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}", required: false
    end

    let(:tenant_id) { Tenant.current.id }
    let(:project) { create(:project_xl, phases_count: 8) }
    let(:new_slug) { 'awesome-project' }
    let(:new_publication_status) { 'draft' }
    let(:id) { project.id }

    describe 'Export a project template' do
      example_request 'it exports a project' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        template = YAML.load(json_response[:template_yaml])

        expect(template['models']['project'].first.dig('title_multiloc', 'en')).to eq project.title_multiloc['en']
        expect(template['models']['phase'].size).to eq project.phases.count
        expect(template['models']['phase'].pluck('start_at')).to match project.phases.map(&:start_at).map(&:iso8601)
        expect(template['models']['project_image'].pluck('remote_image_url')).to match project.project_images.map(&:image_url)
        expect(template['models']['project'].first.dig('admin_publication_attributes', 'publication_status')).to eq 'draft'
      end
    end
  end

  post 'admin_api/projects/template_import' do
    parameter :tenant_id, 'The tenant id in which to import the project', required: true

    with_options scope: :project do
      parameter :template_yaml, 'The yml template for the project to import', required: true
      parameter :folder_id, 'The folder id in which to import the project', required: false
    end

    let(:tenant) { create(:tenant) }
    let(:folder) { tenant.switch { create(:project_folder) } }
    let(:template) do
      create(:tenant).switch do
        project = create(:project_xl, phases_count: 3, images_count: 0, files_count: 0) # no images nor files because URL's will not be available
        ProjectCopyService.new.export(project)
      end
    end

    describe 'Import a project template' do
      example 'it imports a project' do
        do_request(tenant_id: tenant.id, project: { template_yaml: template.to_yaml, folder_id: folder.id })
        expect(status).to eq(200)

        tenant.switch do
          project = Project.first

          expect(template['models']['project'].first.dig('title_multiloc', 'en')).to eq project.title_multiloc['en']
          expect(template['models']['phase'].size).to eq project.phases.count
          expect(template['models']['phase'].pluck('start_at')).to match_array project.phases.map(&:start_at).map(&:iso8601)
          expect(project.folder_id).to eq folder.id
        end
      end

      if defined?(NLP)
        example 'it enqueues DumpTenantJob once if NLP defined' do
          expect do
            do_request(tenant_id: tenant.id, project: { template_yaml: template.to_yaml, folder_id: folder.id })
          end
            .to have_enqueued_job(DumpTenantJob)
        end
      end
    end
  end
end
