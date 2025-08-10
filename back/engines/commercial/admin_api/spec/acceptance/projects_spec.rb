# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project', admin_api: true do
  before do
    header 'Content-Type', 'application/json'
    header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')
  end

  get 'admin_api/projects' do
    let(:tenant_id) { Tenant.current.id }
    let!(:project) { create(:project) }
    example_request 'List all projects' do
      expect(status).to eq 200
      expect(json_response_body.size).to eq 1
      expect(json_response_body.first).to include(
        id: project.id,
        title_multiloc: kind_of(Hash),
        description_multiloc: kind_of(Hash),
        slug: project.slug,
        map_config_id: nil,
        visible_to: 'public'
      )
      expect(json_response_body.first[:admin_publication]).to include(
        publication_status: 'published'
      )
      expect(json_response_body.first[:folder]).to be_nil
    end
  end

  get 'admin_api/projects/:id/template_export' do
    parameter :tenant_id, 'The tenant id from which to export the project', required: true
    with_options scope: :project do
      parameter :include_ideas, "Whether to also include the project's ideas, comments, reactions and participants", required: false
      parameter :anonymize_users, 'Generate new first and last name, email etc.', required: false
      parameter :translate_content, 'Translate the content to other languages', required: false
      parameter :shift_timestamps, 'Change the timestamps by the specified number of days', required: false
      parameter :new_slug, 'The new slug for the copied project', required: false
      parameter :new_title_multiloc, 'The new title for the copied project', required: false
      parameter :new_publication_status, "The new publication status for the new project. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}", required: false
      parameter :local_create, 'Whether to the project copy was initiated locally, via the create project from template UI', required: false
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
        template = YAML.load(json_response[:template_yaml], aliases: true)

        expect(template['models']['project'].first.dig('title_multiloc', 'en')).to eq project.title_multiloc['en']
        expect(template['models']['phase'].size).to eq project.phases.count
        expect(template['models']['phase'].pluck('start_at')).to match(project.phases.map { |x| x.start_at.iso8601 })
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

    context 'when local_create param not true' do
      describe 'Import a project template' do
        example 'enqueues an AdminApi::CopyProjectJob' do
          template_yaml = template.to_yaml

          local_creator = nil

          expect do
            do_request(tenant_id: tenant.id, project: { template_yaml: template_yaml, folder_id: folder.id })
          end.to enqueue_job(AdminApi::CopyProjectJob).with(template_yaml, folder.id, local_creator)

          expect(status).to eq(202)
        end
      end
    end

    context 'when local_create param IS true' do
      # We use tenant.switch in the test to ensure all operations run in the
      # correct tenant context for multi-tenant data isolation and job serialization.
      let!(:user) do
        tenant.switch { create(:user) }
      end
      let(:template_yaml) { template.to_yaml }

      before do
        allow_any_instance_of(AdminApi::ProjectsController)
          .to receive(:jwt_payload)
          .and_return({ 'sub' => user&.id })
      end

      example 'enqueues an AdminApi::CopyProjectJob' do
        tenant.switch do
          expect do
            do_request(tenant_id: tenant.id, project: { template_yaml: template_yaml, folder_id: folder.id, local_create: true })
          end.to enqueue_job(AdminApi::CopyProjectJob).with(template_yaml, folder.id, user)

          expect(status).to eq(202)
        end
      end

      context 'when User with id from JWT payload not found' do
        let!(:user) { nil }

        example '[Error] Does not enqueue an AdminApi::CopyProjectJob' do
          expect do
            do_request(tenant_id: tenant.id, project: { template_yaml: template_yaml, folder_id: folder.id, local_create: true })
          end.not_to enqueue_job(AdminApi::CopyProjectJob)

          expect(status).to eq(422)
        end

        example "[Error] Raises 'User with id {id.inspect} from JWT payload not found'" do
          do_request(tenant_id: tenant.id, project: { template_yaml: template_yaml, folder_id: folder.id, local_create: true })
          expect(json_response_body.to_s).to include('User with id nil from JWT payload not found')
        end
      end
    end

    context 'when when local_create param IS true but no JWT header found' do
      let(:template_yaml) { template.to_yaml }

      example '[Error] Does not enqueue an AdminApi::CopyProjectJob' do
        expect do
          do_request(tenant_id: tenant.id, project: { template_yaml: template_yaml, folder_id: folder.id, local_create: true })
        end.not_to enqueue_job(AdminApi::CopyProjectJob)

        expect(status).to eq(422)
      end

      example "[Error] Raises 'Missing X-JWT header'" do
        do_request(tenant_id: tenant.id, project: { template_yaml: template_yaml, folder_id: folder.id, local_create: true })
        expect(json_response_body.to_s).to include('Missing X-JWT header')
      end
    end
  end
end
