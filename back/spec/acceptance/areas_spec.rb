# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative 'shared/publication_filtering_model'

resource 'Areas' do
  explanation 'Areas are geographical regions. Each tenant has its own custom set of areas.'
  header 'Content-Type', 'application/json'

  get 'web_api/v1/areas' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of areas per page'
    end

    let!(:areas) { create_list(:area, 3) }

    example_request 'List all areas' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq(3)
    end

    example 'List all topics for onboarding' do
      areas.last.update!(include_in_onboarding: true)
      do_request for_onboarding: true
      assert_status 200
      expect(response_data.pluck(:id)).to eq [areas.last.id]
    end

    example 'List all areas sorted by project count' do
      projects = create_list(:project, 5)
      areas[0].update!(projects: [projects[0], projects[2]])
      areas[2].update!(projects: [projects[2], projects[4], projects[3]])

      do_request sort: 'projects_count'

      assert_status 200
      expect(response_data.size).to eq(3)
      expect(response_data.pluck(:id)).to eq [areas[2].id, areas[0].id, areas[1].id]
    end
  end

  get 'web_api/v1/areas/:id' do
    let(:areas) { create_list(:area, 2) }
    let(:id) { areas.first.id }

    example_request 'Get one area by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq(id)
    end
  end

  context 'when admin' do
    before do
      header_token_for user
      CustomField.create!(
        resource_type: 'User',
        key: 'domicile',
        title_multiloc: { 'en' => 'Domicile' },
        input_type: 'select',
        required: false,
        ordering: 2,
        enabled: true,
        code: 'domicile'
      )
    end

    let(:user) { create(:admin) }

    get 'web_api/v1/areas/:id' do
      let(:area) { create(:area) }
      let!(:followers) do
        [user, create(:user)].map do |user|
          create(:follower, followable: area, user: user)
        end
      end
      let(:id) { area.id }

      example_request 'Get one area by ID' do
        assert_status 200

        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :followers_count)).to eq 2
        expect(json_response.dig(:data, :relationships, :user_follower, :data, :id)).to eq followers.first.id
      end
    end

    post 'web_api/v1/areas' do
      with_options scope: :area do
        parameter :title_multiloc, 'The title of the area, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the area, as a multiloc string', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Area)

      let(:area) { build(:area) }
      let(:title_multiloc) { area.title_multiloc }

      example_request 'Create an area' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    patch 'web_api/v1/areas/:id' do
      with_options scope: :area do
        parameter :title_multiloc, 'The title of the area, as a multiloc string'
        parameter :description_multiloc, 'The description of the area, as a multiloc string'
        parameter :include_in_onboarding, 'Whether or not to include the area in the list presented during onboarding, a boolean'
      end

      ValidationErrorHelper.new.error_fields(self, Area)

      let!(:area) { create(:area) }
      let(:id) { area.id }
      let(:title_multiloc) { { 'en' => 'Krypton' } }
      let(:description_multiloc) { { 'en' => 'Home planet of Superman' } }
      let(:include_in_onboarding) { !!area.include_in_onboarding }

      example_request 'Update an area' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data, :attributes, :include_in_onboarding)).to be include_in_onboarding
      end
    end

    patch 'web_api/v1/areas/:id/reorder' do
      with_options scope: :area do
        parameter :ordering, 'The position, starting from 0, where the area should be at. Areas after will move down.', required: true
      end

      let!(:area) { create(:area) }
      let(:id) { area.id }
      let(:ordering) { 1 }

      example 'Reorder an area' do
        area1, area2 = create_list(:area, 2)

        expect(area.ordering).to eq 0
        expect(area1.ordering).to eq 1
        expect(area2.ordering).to eq 2

        do_request
        assert_status 200

        expect(area.reload.ordering).to eq 1
        expect(area1.reload.ordering).to eq 0
        expect(area2.reload.ordering).to eq 2
        expect(area.custom_field_option.ordering).to eq 1
      end
    end

    delete 'web_api/v1/areas/:id' do
      let(:area) { create(:area) }
      let!(:id) { area.id }

      example 'Delete an area' do
        old_count = Area.count
        do_request
        expect(response_status).to eq 200
        expect { Area.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(Area.count).to eq(old_count - 1)
      end

      example "Deleting an area that's still referenced in a user's setting", document: false do
        custom_field_values = { 'domicile' => area.id }
        user = create(:user, custom_field_values: custom_field_values)
        expect(user.reload.custom_field_values).to eq custom_field_values
        do_request
        expect(response_status).to eq 200
        expect { Area.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(user.reload.custom_field_values).to eq({})
      end
    end
  end

  context 'when citizen' do
    get 'web_api/v1/areas' do
      it_behaves_like 'publication filtering model', 'area'
    end
  end

  get 'web_api/v1/areas/with_visible_projects_counts' do
    before do
      user = create(:user)
      header_token_for(user)
    end

    let!(:area1) { create(:area, title_multiloc: { en: 'area 1' }) }
    let!(:area2) { create(:area, title_multiloc: { en: 'area 2' }) }
    let!(:area3) { create(:area, title_multiloc: { en: 'area 3' }) }

    let!(:project_for_area1) { create(:project, areas: [area1]) }
    let!(:project_for_areas1and2) { create(:project, areas: [area1, area2]) }

    let!(:visible_project_for_all_areas) { create(:project, include_all_areas: true) }
    let!(:_invisible_project_for_all_areas) { create(:project, include_all_areas: true, visible_to: 'admins') }

    example_request 'it includes the visible_projects_count, and orders the areas by them' do
      assert_status 200

      json_response = json_parse(response_body)
      expect(json_response[:data].map { |d| d[:attributes][:visible_projects_count] }).to eq [3, 2, 1]
    end

    example 'returns zero counts for areas with no projects, even when no visible projects', document: false do
      project_for_area1.destroy!
      project_for_areas1and2.destroy!
      visible_project_for_all_areas.destroy!

      do_request
      json_response = json_parse(response_body)
      expect(json_response[:data].map { |d| d[:attributes][:visible_projects_count] }).to eq [0, 0, 0]
    end

    example 'orders by ordering when visible_projects_count values are equal', document: false do
      project_for_area1.destroy!
      project_for_areas1and2.destroy!
      visible_project_for_all_areas.destroy!

      do_request
      json_response = json_parse(response_body)
      expect(json_response[:data].map { |d| d[:attributes][:ordering] })
        .to eq json_response[:data].map { |d| d[:attributes][:ordering] }.sort
    end
  end
end
