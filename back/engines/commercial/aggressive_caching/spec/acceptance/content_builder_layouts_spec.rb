# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ContentBuilderLayouts', :clear_cache, document: false do
  before do
    header 'Content-Type', 'application/json'
    header 'Accept', 'application/json'
    SettingsService.new.activate_feature! 'aggressive_caching'
  end

  get 'web_api/v1/static_pages/:static_page_id/content_builder_layouts/:code' do
    let(:page) { create(:static_page) }
    let(:static_page_id) { page.id }
    let(:code) { 'custom_page' }
    let(:cache_key) { "api_response/example.org/web_api/v1/static_pages/#{static_page_id}/content_builder_layouts/#{code}.json" }

    before { create(:layout, content_buildable: page, code: code) }

    example 'caches for a visitor' do
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read(cache_key)).to be_present
    end

    # A project's page can be visible to this user and not to the next one.
    context 'when logged in' do
      before { header_token_for create(:user) }

      example 'it does not cache' do
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_nil
      end
    end
  end

  get 'web_api/v1/project_folders/:project_folder_id/content_builder_layouts/:code' do
    let(:group_member) { create(:user) }
    let(:folder) { create(:project_folder, projects: [create(:private_groups_project, user: group_member)]) }
    let(:project_folder_id) { folder.id }
    let(:code) { 'project_folder_description' }
    let(:cache_key) { "api_response/example.org/web_api/v1/project_folders/#{project_folder_id}/content_builder_layouts/#{code}.json" }

    before { create(:layout, content_buildable: folder, code: code) }

    example 'refuses a visitor when the folder is hidden from them' do
      do_request
      expect(status).to eq 401
    end

    # A folder can be visible to this user and not to the next one.
    context 'when logged in as a user who can see the folder' do
      before { header_token_for group_member }

      example 'it does not cache' do
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_nil
      end

      example 'a visitor asking next is still refused' do
        do_request
        expect(status).to eq 200

        # Sign out: drop the auth cookie the request sent and any the response set.
        header 'Cookie', nil
        sign_out_client
        do_request
        expect(status).to eq 401
      end
    end

    context 'when the folder is visible to everyone' do
      let(:folder) { create(:project_folder, projects: [create(:project)]) }

      example 'caches for a visitor' do
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_present
      end
    end
  end

  get 'web_api/v1/projects/:project_id/content_builder_layouts/:code' do
    let(:project) { create(:project, :draft) }
    let(:project_id) { project.id }
    let(:code) { 'project_description' }

    before { create(:layout, project: project, code: code) }

    example 'refuses a visitor for a draft project' do
      do_request
      expect(status).to eq 401
    end
  end

  get 'web_api/v1/home_pages/content_builder_layouts/:code' do
    let(:code) { 'homepage' }
    let(:cache_key) { "api_response/example.org/web_api/v1/home_pages/content_builder_layouts/#{code}.json" }

    before { create(:homepage_layout) }

    context 'when logged in' do
      before { header_token_for create(:user) }

      example 'it caches' do
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_present
      end
    end
  end
end
