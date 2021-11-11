require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Areas" do

  explanation "Areas are geographical regions. Each tenant has its own custom set of areas."

  before do
    header "Content-Type", "application/json"
    @areas = create_list(:area, 5)
  end

  get "web_api/v1/areas" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of areas per page"
    end
    example_request "List all areas" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end
  end

  get "web_api/v1/areas/:id" do
    let(:id) {@areas.first.id}

    example_request "Get one area by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @areas.first.id
    end
  end

  context "when admin" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post "web_api/v1/areas" do
      with_options scope: :area do
        parameter :title_multiloc, "The title of the area, as a multiloc string", required: true
        parameter :description_multiloc, "The description of the area, as a multiloc string", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Area)

      let(:area) { build(:area) }
      let(:title_multiloc) { area.title_multiloc }

      example_request "Create an area" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    patch "web_api/v1/areas/:id" do
      with_options scope: :area do
        parameter :title_multiloc, "The title of the area, as a multiloc string"
        parameter :description_multiloc, "The description of the area, as a multiloc string"
      end
      ValidationErrorHelper.new.error_fields(self, Area)

      let(:area) { create(:area) }
      let(:id) { area.id }
      let(:title_multiloc) { {'en' => "Krypton"} }
      let(:description_multiloc) { {'en' => "Home planet of Superman"} }

      example_request "Update an area" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
      end
    end

    delete "web_api/v1/areas/:id" do
      before do
        CustomField.create!(
          resource_type: 'User',
          key: 'domicile',
          title_multiloc: {'en' => 'Domicile'},
          input_type: 'select',
          required: false,
          ordering: 2,
          enabled: true,
          code: 'domicile'
        )
      end

      let(:area) { create(:area) }
      let!(:id) { area.id }

      example "Delete an area" do
        old_count = Area.count
        do_request
        expect(response_status).to eq 200
        expect{Area.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(Area.count).to eq (old_count - 1)
      end

      example "Deleting an area that's still referenced in a user's setting", document: false do
        custom_field_values = {'domicile' => area.id}
        user = create(:user, custom_field_values: custom_field_values)
        expect(user.reload.custom_field_values).to eq custom_field_values
        do_request
        expect(response_status).to eq 200
        expect{Area.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(user.reload.custom_field_values).to eq({})
      end
    end

    patch "web_api/v1/areas/:id/reorder" do
      with_options scope: :area do
        parameter :ordering, "The position, starting from 0, where the area should be at. Publications after will move down.", required: true
      end

      before do
        create_list(:area, 4)
      end

      let(:id) { Area.last.id }
      let(:ordering) { 1 }

      example "Reorder an Area" do
        area = Area.find_by(ordering: ordering)
        do_request
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :ordering)).to match ordering
        expect(Area.find_by(ordering: ordering).id).to eq id
        expect(area.reload.ordering).to eq 2 # previous second is now third
      end
    end
  end

  context 'when citizen' do
    before do
      user_header_token

      @areas = create_list(:area, 4)

      @projects = ['published', 'draft', 'archived', 'published']
        .map { |ps|  create(:project, admin_publication_attributes: {publication_status: ps})}

      for i in 0..3 do
        @projects[i].areas << @areas[i]
        @projects[i].save!
      end
    end

    get "web_api/v1/areas" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of areas per page"
      end
      parameter :only_selected, 'Filter: areas of only visible non-draft projects not in draft folders', required: false

      example "List only selected areas does not include areas only used by draft projects" do
        do_request(only_selected: true)
        expect(status).to eq(200)
        expect(response_data.map { |d| d.dig(:id) }).to match_array [@areas[0].id, @areas[2].id, @areas[3].id]
      end

      if CitizenLab.ee?
        example "List only selected areas does not include areas only used by projects in draft folders" do
          folder = create(:project_folder, projects: @projects.take(2))
          draft_folder = create(:project_folder, admin_publication_attributes: {publication_status: 'draft'}, projects: @projects[2])

          do_request(only_selected: true)
          expect(status).to eq(200)
          expect(response_data.map { |d| d.dig(:id) }).to match_array [@areas[0].id, @areas[3].id]
        end
      end

      example "List only selected areas does not include areas only used by projects not visible to user" do
        group = create(:group)
        group_project = create(:groups_project, group_id: group.id, project_id: @projects[0].id)

        @projects[0].update(visible_to: 'groups')
        @projects[3].update(visible_to: 'admins')

        do_request(only_selected: true)
        expect(status).to eq(200)
        expect(response_data.map { |d| d.dig(:id) }).to match_array [@areas[2].id]
      end
    end
  end
end
