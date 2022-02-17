require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  before do
    header 'Content-Type', 'application/json'
    # @ideas = ['published','published','draft','published','spam','published','published'].map { |ps|  create(:idea, publication_status: ps)}
    # @user = user
    # token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    # header 'Authorization', "Bearer #{token}"
  end

  get 'web_api/v1/ideas' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of ideas per page'
    end
    parameter :assignee, 'Filter by assignee (user id)', required: false

    example 'List all ideas for an assignee' do
      a = create(:admin)
      i = create(:idea, assignee: a)

      do_request assignee: a.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end
  end

  get 'web_api/v1/ideas/as_markers' do
    before do
      locations = [[51.044039,3.716964],[50.845552,4.357355],[50.640255,5.571848],[50.950772,4.308304],[51.215929,4.422602],[50.453848,3.952217],[-27.148983,-109.424659]]
      placenames = ['Ghent', 'Brussels', 'Liège', 'Meise', 'Antwerp', 'Mons', 'Hanga Roa']
      @ideas.each do |i|
        i.location_point_geojson = { "type" => "Point", "coordinates" => locations.pop }
        i.title_multiloc['en'] = placenames.pop
        i.publication_status = 'published'
        i.save!
      end
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of ideas per page'
    end
    parameter :assignee, 'Filter by assignee (user id)', required: false

    example "List all idea markers within a bounding box" do # TODO: make assignee test
      do_request(bounding_box: "[51.208758,3.224363,50.000667,5.715281]") # Bruges-Bastogne

      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response[:data].map{|d| d.dig(:attributes, :title_multiloc, :en)}.sort).to match ['Ghent', 'Brussels', 'Liège', 'Meise', 'Mons'].sort
    end
  end

  get "web_api/v1/ideas/as_xlsx" do
    parameter :project, 'Filter by project', required: false
    parameter :ideas, 'Filter by a given list of idea ids', required: false

    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    example_request "XLSX export" do # TODO: includes assignee?
      expect(status).to eq 200
    end
  end

  get "web_api/v1/ideas/filter_counts" do
    before do
      @t1 = create(:topic)
      @t2 = create(:topic)
      @project = create(:project, allowed_input_topics: [@t1, @t2])

      @a1 = create(:area)
      @a2 = create(:area)
      @s1 = create(:idea_status)
      @s2 = create(:idea_status)
      @i1 = create(:idea, project: @project, topics: [@t1, @t2], areas: [@a1], idea_status: @s1)
      @i2 = create(:idea, project: @project, topics: [@t1], areas: [@a1, @a2], idea_status: @s2)
      @i3 = create(:idea, project: @project, topics: [@t2], areas: [], idea_status: @s2)
      @i4 = create(:idea, project: @project, topics: [], areas: [@a1], idea_status: @s2)
      create(:idea, topics: [@t1, @t2], areas: [@a1, @a2], idea_status: @s1, project: create(:project, allowed_input_topics: [@t1, @t2]))

      # a1 -> 3
      # a2 -> 1
      # t1 -> 2
      # t2 -> 2
      # s1 -> 1
      # s2 -> 3
    end

    parameter :assignee, 'Filter by assignee (user id)', required: false

    let(:projects) {[@project.id]}

    example "List idea counts per filter option on topic" do # TODO: filter by assignee
      do_request topics: [@t1.id], projects: nil
      expect(status).to eq 200
    end
  end

  post "web_api/v1/ideas" do
    with_options scope: :idea do
      parameter :project_id, "The identifier of the project that hosts the idea"
      parameter :assignee_id, "The user id of the admin/moderator that takes ownership. Set automatically if not provided. Only allowed for admins/moderators.", required: false
      parameter :publication_status, "Publication status", required: true, extra: "One of #{Post::PUBLICATION_STATUSES.join(",")}"
      parameter :title_multiloc, "Multi-locale field with the idea title", required: true, extra: "Maximum 100 characters"
      parameter :body_multiloc, "Multi-locale field with the idea body", extra: "Required if not draft"
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::POSTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    let(:idea) { build(:idea) }
    let(:project) { create(:continuous_project) }
    let(:project_id) { project.id }
    let(:title_multiloc) { idea.title_multiloc }
    let(:body_multiloc) { idea.body_multiloc }

    describe do
      example_request "Create an idea" do # TODO: with assignee, and without -> default assignee
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:project,:data, :id)).to eq project_id
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
        expect(json_response.dig(:data,:attributes,:location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data,:attributes,:location_description)).to eq location_description
        expect(project.reload.ideas_count).to eq 1
      end
    end
  end

  patch 'web_api/v1/ideas/:id' do
    before do
      @project = create(:continuous_project)
      @idea =  create(:idea, author: @user, project: @project)
    end

    with_options scope: :idea do
      parameter :assignee_id, 'The user id of the admin/moderator that takes ownership. Only allowed for admins/moderators.' if CitizenLab.ee?
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::POSTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    let(:id) { @idea.id }

    describe do
      let(:assignee_id) { create(:admin).id }

      example 'Changing the assignee as a non-admin does not work', document: false do
        do_request
        expect(status).to be 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :relationships, :assignee)).to be_nil
      end
    end

    context 'when admin' do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      describe do
        let(:assignee_id) { create(:admin).id }

        example_request 'Change the assignee (as an admin)' do
          expect(status).to be 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq assignee_id
        end
      end

      describe 'Change the project' do
        before do
          @project.update! allowed_input_topics: create_list(:topic, 2)
          @project2 = create :project, allowed_input_topics: [@project.allowed_input_topics.first]
          @idea.update! topics: @project.allowed_input_topics
        end

        let(:project_id) { @project2.id }

        example 'Keeps the assignee valid', document: false do
          @idea.update! assignee: create(:project_moderator, projects: [@project])
          do_request

          expect(status).to be 200
          expect(@idea.reload).to be_valid
          expect(@idea.assignee).to be_blank
        end
      end
    end

    context 'when moderator', skip: !CitizenLab.ee? do
      before do
        @moderator = create :project_moderator, projects: [@project]
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      describe do
        let(:assignee_id) { create(:admin).id }

        example_request 'Change the assignee (as a moderator)' do # TODO: as author?
          expect(status).to be 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq assignee_id
        end
      end
    end
  end
end
