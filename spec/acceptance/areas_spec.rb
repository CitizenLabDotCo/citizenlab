require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Areas" do
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
      token = Knock::AuthToken.new(payload: { sub: @admin.id }).token
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

      example_request "Create a comment to an idea" do
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

      example_request "Update a area" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
      end
    end

    delete "web_api/v1/areas/:id" do
      let!(:id) { create(:area).id }

      example("Delete an area") do
        old_count = Area.count
        do_request
        expect(response_status).to eq 200
        expect{Area.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(Area.count).to eq (old_count - 1)
      end
    end
  end
end
