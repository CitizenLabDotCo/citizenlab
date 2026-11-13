# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'AdminSearch' do
  explanation 'Everything the admin quick search can find: managed projects (with phases), folders and spaces'

  let(:json_response) { json_parse(response_body) }
  let(:ids_by_type) do
    json_response[:data].group_by { |item| item[:type] }.transform_values { |items| items.pluck(:id) }
  end

  get 'web_api/v1/admin_search' do
    let!(:folder) { create(:project_folder) }
    let!(:project_in_folder) { create(:project_with_phases, phases_count: 2, folder: folder) }
    let!(:other_project) { create(:project) }
    let!(:hidden_project) { create(:project, hidden: true) }
    let!(:space) { create(:space) }

    before { SettingsService.new.activate_feature!('spaces') }

    context 'as an admin' do
      before { header_token_for(create(:admin)) }

      example 'lists every project, folder and space except hidden projects', document: false do
        do_request
        expect(status).to eq 200

        expect(ids_by_type['project_admin_search']).to contain_exactly(project_in_folder.id, other_project.id)
        expect(ids_by_type['folder_admin_search']).to eq([folder.id])
        expect(ids_by_type['space_admin_search']).to eq([space.id])
      end

      example 'leaves out spaces when the spaces feature is off', document: false do
        SettingsService.new.deactivate_feature!('spaces')

        do_request
        expect(status).to eq 200
        expect(ids_by_type['space_admin_search']).to be_nil
      end
    end

    context 'as a project moderator' do
      before { header_token_for(create(:project_moderator, projects: [other_project])) }

      example 'lists only the projects they manage', document: false do
        do_request
        expect(status).to eq 200

        expect(ids_by_type['project_admin_search']).to eq([other_project.id])
        expect(ids_by_type['folder_admin_search']).to be_nil
        expect(ids_by_type['space_admin_search']).to be_nil
      end
    end

    context 'as a folder moderator' do
      before { header_token_for(create(:project_folder_moderator, project_folders: [folder])) }

      example 'lists their folder and the projects in it', document: false do
        do_request
        expect(status).to eq 200

        expect(ids_by_type['project_admin_search']).to eq([project_in_folder.id])
        expect(ids_by_type['folder_admin_search']).to eq([folder.id])
      end
    end

    context 'as a space moderator' do
      before { header_token_for(create(:space_moderator, spaces: [space])) }

      example 'lists their space', document: false do
        do_request
        expect(status).to eq 200
        expect(ids_by_type['space_admin_search']).to eq([space.id])
      end
    end

    context 'as a resident' do
      before { header_token_for(create(:user)) }

      example_request 'is not allowed', document: false do
        expect(status).to eq 401
      end
    end

    context 'when not signed in' do
      example_request 'is not allowed', document: false do
        expect(status).to eq 401
      end
    end
  end
end
