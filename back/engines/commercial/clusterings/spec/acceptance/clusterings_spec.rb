require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Clusterings" do

  explanation "A clustering is a specific hierarchical classification of ideas, used for analysis"

  before do
    @admin = create(:admin)
    token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @clusterings = create_list(:clustering, 5)
  end

  get "web_api/v1/clusterings" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of clusterings per page"
    end
    example_request "List all clusterings" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end
  end

  get "web_api/v1/clusterings/:id" do
    let(:id) {@clusterings.first.id}

    example_request "Get one clustering by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @clusterings.first.id
    end
  end

  post "web_api/v1/clusterings" do
    with_options scope: :clustering do
      parameter :title_multiloc, "The title of the clustering, as a multiloc string", required: true
      parameter :levels, "An array composed of keywords 'project' and 'topic' that defines how to cluster initially", required: true
      parameter :drop_empty, "A boolean that indicates whether to include empty clusters or not. Defaults to true", required: false
      parameter :topics, 'Filter by topics (OR)', required: false
      parameter :areas, 'Filter by areas (OR)', required: false
      parameter :projects, 'Filter by project', required: false
      parameter :phases, 'Filter by project phase', required: false
      parameter :author, 'Filter by author (user id)', required: false
      parameter :idea_statuses, 'Filter by status (idea status id)', required: false
      parameter :search, 'Filter by searching in title, body and author name', required: false
      parameter :publication_status, "Return only ideas with the specified publication status; returns all pusblished ideas by default", required: false
      parameter :minimal_total_votes, "Minimal amount of votes", request: false
      parameter :minimal_upvotes, "Minimal amount of upvotes", request: false
      parameter :minimal_downvotes, "Minimal amount of downvotes", request: false
    end
    ValidationErrorHelper.new.error_fields(self, Clusterings::Clustering)
    before do
      @topic = create(:topic)
      @project = create(:project, topics: [@topic])
      @idea = create(:idea, project: @project, topics: [@topic])
    end

    let(:clustering) { build(:clustering) }
    let(:title_multiloc) { clustering.title_multiloc }
    let(:levels) {['topic']}

    example_request "Create a clustering" do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
    end

    example "Create a clustering of filtered ideas", document: false do
      t2 = create(:topic)
      p2 = create(:project, topics: [@topic, t2])
      i1, i2, i3 = create_list(:idea, 3, topics: [@topic], project: p2)
      i4 = create(:idea, topics: [t2], project: p2)
      create_list(:vote, 5, mode: 'up', votable: i1)
      create_list(:vote, 5, mode: 'down', votable: i1)
      create_list(:vote, 12, mode: 'up', votable: i4)
      do_request(clustering: {project: p2.id, minimal_total_votes: 10})
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(structure_idea_ids(json_response.dig(:data,:attributes,:structure))).to match_array [i1.id, i4.id]
    end
  end

  patch "web_api/v1/clusterings/:id" do
    with_options scope: :clustering do
      parameter :title_multiloc, "The title of the clustering, as a multiloc string"
      parameter :structure, "The whole clustering definition. Should comply to following JSON schema: #{Clusterings::Clustering::STRUCTURE_JSON_SCHEMA}", required: false
    end
    ValidationErrorHelper.new.error_fields(self, Clusterings::Clustering)

    let(:clustering) { create(:clustering) }
    let(:id) { clustering.id }
    let(:title_multiloc) { {'en' => "Ideas by domain expert"} }
    let(:structure) {{
      "type" => "custom",
      "id" => "633c4eb6-79b0-4f36-9964-fe4cdb35e472",
      "title" => "Some title we have here!",
      "children" => []
    }}

    example_request "Update a clustering" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
      expect(json_response.dig(:data,:attributes,:structure,:id)).to match "633c4eb6-79b0-4f36-9964-fe4cdb35e472"
    end
  end

  delete "web_api/v1/clusterings/:id" do
    let!(:id) { create(:clustering).id }

    example "Delete a clustering" do
      old_count = Clusterings::Clustering.count
      do_request
      expect(response_status).to eq 200
      expect{Clusterings::Clustering.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      expect(Clusterings::Clustering.count).to eq (old_count - 1)
    end
  end

  def structure_idea_ids structure
    if structure[:children]
      structure[:children].flat_map{|child| structure_idea_ids child}
    elsif structure[:type] == 'idea'
      [structure[:id]]
    else
      []
    end
  end
end
