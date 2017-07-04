require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Ideas" do

  before do
    header "Content-Type", "application/json"
    @ideas = create_list(:idea, 5)
    @user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
  end

  get "api/v1/ideas" do
    parameter :topics, 'Filter by topics (AND)', required: false
    parameter :areas, 'Filter by areas (AND)', required: false
    parameter :project, 'Filter by project', required: false
    parameter :author, 'Filter by author (user id)', required: false
    parameter :search, 'Filter by searching in title, body and author name', required: false
    parameter :sort, "Either 'new', '-new', 'trending', '-trending', 'popular' or '-popular'", required: false

    example_request "List all ideas" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end

    example "List all ideas with a topic" do
      t1 = create(:topic)

      i1 = @ideas.first
      i1.topics << t1
      i1.save

      do_request(topics: [t1.id])
      json_response = json_parse(response_body)
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas with all given topics" do
      t1 = create(:topic)
      t2 = create(:topic)

      i1 = @ideas.first
      i1.topics = [t1, t2]
      i1.save

      do_request(topics: [t1.id, t2.id])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List no ideas when not all given topics are there", document: false do
      t1 = create(:topic)
      t2 = create(:topic)

      i1 = @ideas.first
      i1.topics << t1
      i1.save

      do_request(topics: [t1.id, t2.id])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 0
    end

    example "List all ideas with an area" do
      a1 = create(:area)

      i1 = @ideas.first
      i1.areas << a1
      i1.save

      do_request(areas: [a1.id])
      json_response = json_parse(response_body)
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas with all given areas" do
      a1 = create(:area)
      a2 = create(:area)

      i1 = @ideas.first
      i1.areas = [a1, a2]
      i1.save

      do_request(areas: [a1.id, a2.id])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List no ideas when not all given areas are there", document: false do
      a1 = create(:area)
      a2 = create(:area)

      i1 = @ideas.first
      i1.areas << a1
      i1.save

      do_request(areas: [a1.id, a2.id])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 0
    end

    example "List all ideas in a project" do
      l = create(:project)
      i = create(:idea, project: l)

      do_request(project: l.id)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all ideas for a user" do
      u = create(:user)
      i = create(:idea, author: u)

      do_request(author: u.id)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all ideas with search string" do
      u = create(:user)
      i1 = create(:idea, title_multiloc: {en: "This idea is uniqque"})
      i2 = create(:idea, title_multiloc: {en: "This one origiinal"})

      do_request(search: "uniqque")
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas sorted by new" do
      u = create(:user)
      i1 = create(:idea)

      do_request(sort: "new")
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas includes the user_vote" do
      vote = create(:vote, user: @user)
      idea = vote.votable

      do_request
      json_response = json_parse(response_body)
      expect(json_response[:data].map{|d| d[:relationships][:user_vote][:data]}.compact.first[:id]).to eq vote.id
      expect(json_response[:included].map{|i| i[:id]}).to include vote.id
    end
  end

  get "api/v1/ideas/as_xlsx" do
    parameter :project, 'Filter by project', required: false

    example_request "XLSX export" do
      expect(status).to eq 200
    end
  end


  get "api/v1/ideas/:id" do
    let(:id) {@ideas.first.id}

    example_request "Get one idea by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @ideas.first.id
    end
  end



  post "api/v1/ideas" do
    with_options scope: :idea do
      parameter :project_id, "The idea of the project that hosts the idea", extra: ""
      parameter :author_id, "The user id of the user owning the idea", extra: "Required if not draft"
      parameter :publication_status, "Password", required: true, extra: "One of #{Idea::PUBLICATION_STATUSES.join(",")}"
      parameter :title_multiloc, "Multi-locale field with the idea title", required: true, extra: "Maximum 100 characters"
      parameter :body_multiloc, "Multi-locale field with the idea body", extra: "Required if not draft"
      parameter :topic_ids, "Array of ids of the associated topics"
      parameter :area_ids, "Array of ids of the associated areas"
      parameter :location_point_geojson, "A GeoJSON point that situates the location the idea applies to"
      parameter :location_description, "A human readable description of the location the idea applies to"
    end

    describe do
      let(:idea) { build(:idea) }
      let(:project_id) { create(:project).id }
      let(:author_id) { create(:user).id }
      let(:publication_status) { 'published' }
      let(:title_multiloc) { idea.title_multiloc }
      let(:body_multiloc) { idea.body_multiloc }
      let(:topic_ids) { create_list(:topic, 2).map(&:id) }
      let(:area_ids) { create_list(:area, 2).map(&:id) }
      let(:location_point_geojson) { {type: "Point", coordinates: [51.11520776293035, 3.921154106874878]} }
      let(:location_description) { "Stanley Road 4" }

      example_request "Creating a published idea" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match area_ids
        expect(json_response.dig(:data,:attributes,:location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data,:attributes,:location_description)).to eq location_description
      end
    end

  end


  patch "api/v1/ideas/:id" do
    before do
      @idea =  create(:idea, author: @user)
    end

    with_options scope: :idea do
      parameter :project_id, "The idea of the project that hosts the idea", extra: ""
      parameter :author_id, "The user id of the user owning the idea", extra: "Required if not draft"
      parameter :publication_status, "Either #{Idea::PUBLICATION_STATUSES}.join(', ')}"
      parameter :title_multiloc, "Multi-locale field with the idea title", extra: "Maximum 100 characters"
      parameter :body_multiloc, "Multi-locale field with the idea body", extra: "Required if not draft"
      parameter :topic_ids, "Array of ids of the associated topics"
      parameter :area_ids, "Array of ids of the associated areas"
      parameter :location_point_geojson, "A GeoJSON point that situates the location the idea applies to"
      parameter :location_description, "A human readable description of the location the idea applies to"
    end

    let(:id) { @idea.id }
    let(:topic_ids) { create_list(:topic, 2).map(&:id) }
    let(:area_ids) { create_list(:area, 2).map(&:id) }
    let(:location_point_geojson) { {type: "Point", coordinates: [51.4365635, 3.825930459]} }
    let(:location_description) { "Watkins Road 8" }

    describe do
      let(:title_multiloc) { {"en" => "Changed title" } }
      example_request "Updating an idea" do
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc,:en)).to eq "Changed title"
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match area_ids
        expect(json_response.dig(:data,:attributes,:location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data,:attributes,:location_description)).to eq location_description
      end
    end

    describe do
      let(:topic_ids) { [] }
      let(:area_ids) { [] }

      example "Remove the topics/areas" do
        @idea.topics = create_list(:topic, 2)
        @idea.areas = create_list(:area, 2)
        do_request
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match area_ids
      end
    end
  end


  patch "api/v1/ideas/:id" do
    before do
      @idea =  create(:idea, author: @user, publication_status: 'draft')
    end

    parameter :publication_status, "Either #{Idea::PUBLICATION_STATUSES}.join(', ')}", required: true, scope: :idea

    let(:id) { @idea.id }
    let(:publication_status) { 'published' }

    example_request "Updating a draft to a published post" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:publication_status)).to eq "published"
    end
  end

  delete "api/v1/ideas/:id" do
    before do
      @idea = create(:idea, author: @user, publication_status: 'published')
    end
    let(:id) { @idea.id }
    example_request "Delete an idea" do
      expect(response_status).to eq 200
      expect{Idea.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end


end
