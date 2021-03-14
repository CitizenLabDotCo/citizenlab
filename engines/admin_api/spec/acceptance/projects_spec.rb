require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Project", admin_api: true do

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  get "admin_api/projects/:id/template_export" do
    parameter :tenant_id, "The tenant id from which to export the project", required: true
    with_options scope: :project do
      parameter :include_ideas, "Whether to also include the project's ideas, comments, votes and participants", required: false
      parameter :anonymize_users, "Generate new first and last name, email etc.", required: false
      parameter :translate_content, "Translate the content to other languages", required: false
      parameter :shift_timestamps, "Change the timestamps by the specified number of days", required: false
      parameter :new_slug, "The new slug for the copied project", required: false
      parameter :new_title_multiloc, "The new title for the copied project", required: false
      parameter :new_publication_status, "The new publication status for the new project. One of #{AdminPublication::PUBLICATION_STATUSES.join(", ")}", required: false
    end

    let(:tenant_id) { Tenant.current.id }
    let(:project) { create(:project_xl, phases_count: 8) }
    let(:new_slug) { 'awesome-project' }
    let(:new_publication_status) { 'draft' }
    let(:id) { project.id }

    example_request "Export a project template" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      template = YAML.load(json_response[:template_yaml])

      expect(template['models']['project'].first.dig('title_multiloc','en')).to eq project.title_multiloc['en']
      expect(template['models']['phase'].size).to eq project.phases.count
      expect(template['models']['phase'].map{|h| h['start_at']}).to match project.phases.map(&:start_at).map(&:iso8601)
      expect(template['models']['project_image'].map{|h| h['remote_image_url']}).to match project.project_images.map(&:image_url)
      expect(template['models']['project'].first.dig('admin_publication_attributes', 'publication_status')).to eq 'draft'
    end
  end

  post "admin_api/projects/template_import" do
    parameter :tenant_id, "The tenant id in which to import the project", required: true

    with_options scope: :project do
      parameter :template_yaml, "The yml template for the project to import", required: true
    end

    example "Import a project template" do
      tn1 = create(:test_tenant, host: 'abu-dhabi.citizenlab.co')
      tn2 = create(:test_tenant, host: 'las-vegas.citizenlab.co')

      template, project = nil
      Apartment::Tenant.switch(tn1.schema_name) do
        project = create(:project_xl, phases_count: 8, images_count: 0, files_count: 0) # no images nor files because URL's will not be available
        template = AdminApi::ProjectCopyService.new.export(project)
      end

      do_request(tenant_id: tn2.id, project: {template_yaml: template.to_yaml})
      expect(status).to eq 200
      Apartment::Tenant.switch(tn2.schema_name) do
        project_copy = Project.first

        expect(template['models']['project'].first.dig('title_multiloc','en')).to eq project_copy.title_multiloc['en']
        expect(template['models']['phase'].size).to eq project_copy.phases.count
        expect(template['models']['phase'].map{|h| h['start_at']}).to match project_copy.phases.map(&:start_at).map(&:iso8601)
      end
    end
  end
end
