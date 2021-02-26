require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Ideas" do

  explanation "Proposals from citizens to the city."

  before do
    header "Content-Type", "application/json"
    @ideas = ['published','published','draft','published','spam','published','published'].map { |ps|  create(:idea, publication_status: ps)}
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get "web_api/v1/ideas" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of ideas per page"
    end
    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :areas, 'Filter by areas (OR)', required: false
    parameter :projects, 'Filter by projects (OR)', required: false
    parameter :phase, 'Filter by project phase', required: false
    parameter :author, 'Filter by author (user id)', required: false
    parameter :assignee, 'Filter by assignee (user id)', required: false
    parameter :idea_status, 'Filter by status (idea status id)', required: false
    parameter :search, 'Filter by searching in title and body', required: false
    parameter :sort, "Either 'new', '-new', 'trending', '-trending', 'popular', '-popular', 'author_name', '-author_name', 'upvotes_count', '-upvotes_count', 'downvotes_count', '-downvotes_count', 'status', '-status', 'baskets_count', '-baskets_count', 'random'", required: false
    parameter :publication_status, "Filter by publication status; returns all published ideas by default", required: false
    parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(", ")}", required: false
    parameter :feedback_needed, "Filter out ideas that need feedback", required: false
    parameter :filter_trending, "Filter out truly trending ideas", required: false

    example_request "List all published ideas (default behaviour)" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response[:data].map { |d| d.dig(:attributes,:publication_status) }).to all(eq 'published')
    end

    example "Don't list drafts (default behaviour)", document: false do
      do_request publication_status: 'draft'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 0
    end

    example "List all ideas for a topic" do
      t1 = create(:topic)

      i1 = @ideas.first
      i1.project.update!(topics: Topic.all)
      i1.topics << t1
      i1.save

      do_request topics: [t1.id]
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas for a topic with other filters enabled", document: false do
      t1 = create(:topic)

      i1 = @ideas.first
      i1.project.update!(topics: Topic.all)
      i1.topics << t1
      i1.save

      do_request topics: [t1.id], sort: 'random'
      expect(status).to eq(200)
    end

    example "List all ideas which match one of the given topics", document: false do
      t1 = create(:topic)
      t2 = create(:topic)
      t3 = create(:topic)

      i1 = @ideas[0]
      i1.project.update!(topics: Topic.all)
      i1.topics = [t1,t3]
      i1.save!
      i2 = @ideas[1]
      i2.project.update!(topics: Topic.all)
      i2.topics = [t2]
      i2.save!
      i3 = @ideas[3]
      i3.project.update!(topics: Topic.all)
      i3.topics = [t3,t1,t2]
      i3.save!

      do_request topics: [t1.id, t2.id]
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].map{|h| h[:id]}).to match_array [i1.id, i2.id, i3.id]
    end


    example "List all ideas with an area" do
      a1 = create(:area)

      i1 = @ideas.first
      i1.areas << a1
      i1.save!

      do_request areas: [a1.id]
      json_response = json_parse(response_body)
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas which match one of the given areas", document: false do
      a1 = create(:area)
      a2 = create(:area)

      i1 = @ideas.first
      i1.areas = [a1]
      i1.save
      i2 = @ideas.second
      i2.areas = [a2]
      i2.save

      do_request areas: [a1.id, a2.id]
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].map{|h| h[:id]}).to match_array [i1.id, i2.id]
    end

    example "List all ideas in a project" do
      l = create(:project, with_permissions: true)
      i = create(:idea, project: l)

      do_request projects: [l.id]

      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all ideas in any of the given projects", document: false do
      i1 = create(:idea)
      i2 = create(:idea)

      do_request projects: [i1.project.id, i2.project.id]

      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].map{|d| d[:id]}).to match_array [i1.id, i2.id]
    end

    example "List all ideas in a phase of a project" do
      pr = create(:project_with_phases, with_permissions: true)
      ph1 = pr.phases.first
      ph2 = pr.phases.second
      i1 = create(:idea, phases: [ph1], project: pr)
      i2 = create(:idea, phases: [ph2], project: pr)
      i3 = create(:idea, phases: [ph1, ph2], project: pr)

      do_request phase: ph2.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].map{|d| d[:id]}).to match_array [i2.id, i3.id]
    end

    example "List all ideas in published projects" do
      idea = create(:idea, project: create(:project, admin_publication_attributes: {publication_status: 'archived'}))
      do_request(project_publication_status: 'published')
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response[:data].map{|d| d[:id]}).not_to include(idea.id)
    end

    example "List all ideas for an idea status" do
      status = create(:idea_status)
      i = create(:idea, idea_status: status)

      do_request idea_status: status.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all ideas for a user" do
      u = create(:user)
      i = create(:idea, author: u)

      do_request author: u.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all ideas for an assignee" do
      a = create(:admin)
      i = create(:idea, assignee: a)

      do_request assignee: a.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all ideas that need feedback" do
      TenantTemplateService.new.resolve_and_apply_template('base')
      i = create(:idea, idea_status: IdeaStatus.find_by(code: 'proposed'))

      do_request feedback_needed: true
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "Search for ideas" do
      i1 = create(:idea, title_multiloc: {en: "This idea is uniqque"})
      i2 = create(:idea, title_multiloc: {en: "This one origiinal"})

      do_request search: "uniqque"
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas sorted by new" do
      i1 = create(:idea)

      do_request sort: "new"
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas sorted by baskets count", document: false do
      i1 = create(:idea)
      baskets = create_list(:basket, 3, ideas: [i1])
      SideFxBasketService.new.update_basket_counts

      do_request sort: "-baskets_count"
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas by random ordering", document: false do
      i1 = create(:idea)

      do_request sort: "random"
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
    end


    example "List all ideas includes the user_vote", document: false do
      vote = create(:vote, user: @user)
      idea = vote.votable

      do_request
      json_response = json_parse(response_body)
      expect(json_response[:data].map{|d| d[:relationships][:user_vote][:data]}.compact.first[:id]).to eq vote.id
      expect(json_response[:included].map{|i| i[:id]}).to include vote.id
    end

    example "Search for ideas should work with trending ordering", document: false do
      i1 = Idea.first
      i1.title_multiloc['nl-BE'] = 'Park met blauwe bomen'
      i1.title_multiloc['en'] = 'A park with orange grass'
      i1.save!

      do_request search: 'Park', sort: 'trending'
      expect(status).to eq(200)
    end

    example "Default trending ordering", document: false do
      do_request project_publication_status: 'published', sort: 'trending'
      expect(status).to eq(200)
    end
  end

  get "web_api/v1/ideas/as_markers" do
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
      parameter :number, "Page number"
      parameter :size, "Number of ideas per page"
    end
    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :areas, 'Filter by areas (OR)', required: false
    parameter :projects, 'Filter by projects (OR)', required: false
    parameter :phase, 'Filter by project phase', required: false
    parameter :author, 'Filter by author (user id)', required: false
    parameter :assignee, 'Filter by assignee (user id)', required: false
    parameter :idea_status, 'Filter by status (idea status id)', required: false
    parameter :search, 'Filter by searching in title and body', required: false
    parameter :publication_status, "Return only ideas with the specified publication status; returns all pusblished ideas by default", required: false
    parameter :bounding_box, "Given an [x1,y1,x2,y2] array of doubles (x being latitude and y being longitude), the idea markers are filtered to only retain those within the (x1,y1)-(x2,y2) box.", required: false
    parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(", ")}", required: false
    parameter :feedback_needed, "Filter out ideas that need feedback", required: false
    parameter :filter_trending, "Filter out truly trending ideas", required: false

    example "List all idea markers within a bounding box" do
      do_request(bounding_box: "[51.208758,3.224363,50.000667,5.715281]") # Bruges-Bastogne

      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response[:data].map{|d| d.dig(:attributes, :title_multiloc, :en)}.sort).to match ['Ghent', 'Brussels', 'Liège', 'Meise', 'Mons'].sort
    end

    example "List all idea markers in a phase of a project", document: false do
      pr = create(:project_with_phases, with_permissions: true)
      ph1 = pr.phases.first
      ph2 = pr.phases.second
      i1 = create(:idea, phases: [ph1], project: pr)
      i2 = create(:idea, phases: [ph2], project: pr)
      i3 = create(:idea, phases: [ph1, ph2], project: pr)

      do_request phase: ph2.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].map{|d| d[:id]}).to match_array [i2.id, i3.id]
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

    example_request "XLSX export" do
      expect(status).to eq 200
    end

    describe do
      before do
        @project = create(:project)
        @selected_ideas = @ideas.select(&:published?).shuffle.take 3
        @selected_ideas.each do |idea|
          idea.update! project: @project
        end
      end
      let(:project) { @project.id }

      example_request 'XLSX export by project' do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq (@selected_ideas.size + 1)
      end
    end

    describe do
      before do
        @selected_ideas = @ideas.select(&:published?).shuffle.take 2
      end
      let(:ideas) { @selected_ideas.map(&:id) }

      example_request 'XLSX export by idea ids' do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq (@selected_ideas.size + 1)
      end
    end

    describe do
      before do
        @user = create(:user)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      example_request '[error] XLSX export by a normal user', document: false do
        expect(status).to eq 401
      end
    end
  end

  get "web_api/v1/ideas/as_xlsx_with_tags" do
    parameter :project, 'Filter by project', required: false
    parameter :ideas, 'Filter by a given list of idea ids', required: false

    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    example_request "XLSX export" do
      expect(status).to eq 200
    end

    describe do
      before do
        @project = create(:project)
        @tag1 = Tagging::Tag.create(title_multiloc: {'en' => 'label'})
        @tag2 = Tagging::Tag.create(title_multiloc: {'en' => 'item'})
        @selected_ideas = @ideas.select(&:published?).shuffle.take 3
        @selected_ideas.each do |idea|
          idea.update! project: @project
        end
        Tagging::Tagging.create(idea: @selected_ideas[0], tag: @tag1, confidence_score: 1)
        Tagging::Tagging.create(idea: @selected_ideas[0], tag: @tag2,  confidence_score: 0.45)
        Tagging::Tagging.create(idea: @selected_ideas[1], tag: @tag1,  confidence_score: 1)
      end
      let(:project) { @project.id }

      example_request 'XLSX export by project' do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        label_col = worksheet.map {|col| col.cells[4].value}
        _, *labels = label_col
        expect(labels).to match_array([1,1,0])
        item_col = worksheet.map {|col| col.cells[3].value}
        _, *items = item_col
        expect(items).to match_array([0, 0, 0.45])
        expect(worksheet.count).to eq (@selected_ideas.size + 1)
      end
    end

    describe do
      before do
        @selected_ideas = @ideas.select(&:published?).shuffle.take 2
      end
      let(:ideas) { @selected_ideas.map(&:id) }

      example_request 'XLSX export by idea ids' do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq (@selected_ideas.size + 1)
      end
    end

    describe do
      before do
        @user = create(:user)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      example_request '[error] XLSX export by a normal user', document: false do
        expect(status).to eq 401
      end
    end
  end


  get "web_api/v1/ideas/filter_counts" do
    before do
      @t1 = create(:topic)
      @t2 = create(:topic)
      @project = create(:project, topics: [@t1, @t2])

      @a1 = create(:area)
      @a2 = create(:area)
      @s1 = create(:idea_status)
      @s2 = create(:idea_status)
      @i1 = create(:idea, project: @project, topics: [@t1, @t2], areas: [@a1], idea_status: @s1)
      @i2 = create(:idea, project: @project, topics: [@t1], areas: [@a1, @a2], idea_status: @s2)
      @i3 = create(:idea, project: @project, topics: [@t2], areas: [], idea_status: @s2)
      @i4 = create(:idea, project: @project, topics: [], areas: [@a1], idea_status: @s2)
      create(:idea, topics: [@t1, @t2], areas: [@a1, @a2], idea_status: @s1, project: create(:project, topics: [@t1, @t2]))

      # a1 -> 3
      # a2 -> 1
      # t1 -> 2
      # t2 -> 2
      # s1 -> 1
      # s2 -> 3
    end

    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :areas, 'Filter by areas (OR)', required: false
    parameter :projects, 'Filter by projects (OR)', required: false
    parameter :phase, 'Filter by project phase', required: false
    parameter :author, 'Filter by author (user id)', required: false
    parameter :assignee, 'Filter by assignee (user id)', required: false
    parameter :idea_status, 'Filter by status (idea status id)', required: false
    parameter :search, 'Filter by searching in title and body', required: false
    parameter :publication_status, "Return only ideas with the specified publication status; returns all pusblished ideas by default", required: false
    parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(", ")}", required: false
    parameter :feedback_needed, "Filter out ideas that need feedback", required: false
    parameter :filter_trending, "Filter out truly trending ideas", required: false

    let(:projects) {[@project.id]}

    example_request "List idea counts per filter option" do
      expect(status).to eq 200
      json_response = json_parse(response_body)

      expect(json_response[:idea_status_id][@s1.id.to_sym]).to eq 1
      expect(json_response[:idea_status_id][@s2.id.to_sym]).to eq 3
      expect(json_response[:area_id][@a1.id.to_sym]).to eq 3
      expect(json_response[:area_id][@a2.id.to_sym]).to eq 1
      expect(json_response[:topic_id][@t1.id.to_sym]).to eq 2
      expect(json_response[:topic_id][@t2.id.to_sym]).to eq 2
      expect(json_response[:total]).to eq 4
    end

    example "List idea counts per filter option on topic" do
      do_request topics: [@t1.id], projects: nil
      expect(status).to eq 200
    end

    example "List idea counts per filter option on area" do
      do_request areas: [@a1.id], projects: nil
      expect(status).to eq 200
    end

    example "List idea counts per filter option with a search string" do
      do_request search: 'trees'
      expect(status).to eq 200
    end
  end


  get "web_api/v1/ideas/:id" do
    let(:idea) {@ideas.first}
    let!(:baskets) {create_list(:basket, 2, ideas: [idea])}
    let!(:topic) {create(:topic, ideas: [idea], projects: [idea.project])}
    let!(:user_vote) {create(:vote, user: @user, votable: idea)}
    let(:id) {idea.id}

    example_request "Get one idea by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)

      expect(json_response.dig(:data, :id)).to eq idea.id
      expect(json_response.dig(:data, :type)).to eq 'idea'
      expect(json_response.dig(:data, :attributes)).to include(
        slug: idea.slug,
        budget: idea.budget,
        action_descriptor: {
          commenting_idea: {enabled: false, disabled_reason: 'not_permitted', future_enabled: nil},
          voting_idea: {enabled: false, downvoting_enabled: true, disabled_reason: 'not_permitted', future_enabled: nil, cancelling_enabled: false},
          comment_voting_idea: {enabled: false, disabled_reason: 'not_permitted', future_enabled: nil},
          budgeting: {enabled: false, disabled_reason: 'not_permitted', future_enabled: nil}}
        )
      expect(json_response.dig(:data, :relationships)).to include(
        topics: {
          data: [{id: topic.id, type: 'topic'}]
        },
        areas: {data: []},
        author: {data: {id: idea.author_id, type: 'user'}},
        idea_status: {data: {id: idea.idea_status_id, type: 'idea_status'}},
        user_vote: {data: {id: user_vote.id, type: 'vote'}}
        )
    end
  end

  get "web_api/v1/ideas/by_slug/:slug" do
    let(:slug) {@ideas.first.slug}

    example_request "Get one idea by slug" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @ideas.first.id
    end

    describe do
      let(:slug) {"unexisting-idea"}

      example "[error] Get an unexisting idea", document: false do
        do_request
        expect(status).to eq 404
      end
    end
  end

  post "web_api/v1/ideas" do
    before do
      IdeaStatus.create_defaults
    end

    with_options scope: :idea do
      parameter :project_id, "The identifier of the project that hosts the idea", extra: ""
      parameter :phase_ids, "The phases the idea is part of, defaults to the current only, only allowed by admins"
      parameter :author_id, "The user id of the user owning the idea", extra: "Required if not draft"
      parameter :assignee_id, "The user id of the admin/moderator that takes ownership. Set automatically if not provided. Only allowed for admins/moderators."
      parameter :idea_status_id, "The status of the idea, only allowed for admins", extra: "Defaults to status with code 'proposed'"
      parameter :publication_status, "Publication status", required: true, extra: "One of #{Post::PUBLICATION_STATUSES.join(",")}"
      parameter :title_multiloc, "Multi-locale field with the idea title", required: true, extra: "Maximum 100 characters"
      parameter :body_multiloc, "Multi-locale field with the idea body", extra: "Required if not draft"
      parameter :topic_ids, "Array of ids of the associated topics"
      parameter :area_ids, "Array of ids of the associated areas"
      parameter :location_point_geojson, "A GeoJSON point that situates the location the idea applies to"
      parameter :location_description, "A human readable description of the location the idea applies to"
      parameter :budget, "The budget needed to realize the idea, as determined by the city"
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::POSTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    let(:idea) { build(:idea) }
    let(:project) { create(:continuous_project, with_permissions: true) }
    let(:project_id) { project.id }
    let(:publication_status) { 'published' }
    let(:title_multiloc) { idea.title_multiloc }
    let(:body_multiloc) { idea.body_multiloc }
    let(:topic_ids) { create_list(:topic, 2, projects: [project]).map(&:id) }
    let(:area_ids) { create_list(:area, 2).map(&:id) }
    let(:location_point_geojson) { {type: "Point", coordinates: [51.11520776293035, 3.921154106874878]} }
    let(:location_description) { "Stanley Road 4" }

    describe do
      example_request "Create an idea" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:project,:data, :id)).to eq project_id
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
        expect(json_response.dig(:data,:attributes,:location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data,:attributes,:location_description)).to eq location_description
        expect(project.reload.ideas_count).to eq 1
      end

      example "Check for the automatic creation of an upvote by the author when an idea is created", document: false do
        do_request
        json_response = json_parse(response_body)
        new_idea = Idea.find(json_response.dig(:data, :id))
        expect(new_idea.votes.size).to eq 1
        expect(new_idea.votes[0].mode).to eq 'up'
        expect(new_idea.votes[0].user.id).to eq @user.id
        expect(json_response[:data][:attributes][:upvotes_count]).to eq 1
      end
    end

    describe 'For projects without ideas_order' do
      let(:project) { create(:continuous_project, with_permissions: true) }

      before do
        project.update_attribute(:ideas_order, nil)
      end

      example_request "Creates an idea", document: false do
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

    describe do
      let(:idea) { build(:idea) }
      let(:project) { create(:continuous_project, with_permissions: true) }
      let(:project_id) { project.id }
      let(:title_multiloc) { {'en' => 'I have a fantastic Idea but with a superduper extremely long title so someone should do something about this or else it may look bad in the UI and no one would read it anyways'} } # { idea.title_multiloc }
      let(:body_multiloc) { idea.body_multiloc }

      example_request "[error] Create an idea with too long title" do
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors, :title_multiloc)).to eq [{error: 'too_long'}]
      end
    end

    describe do
      let(:publication_status) { "fake_status" }

      example_request "[error] Creating an invalid idea" do
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors, :publication_status)).to eq [{error: 'inclusion', value: 'fake_status'}]
      end
    end

    describe do
      let(:project) { create(:project_with_current_phase, with_permissions: true, current_phase_attrs: {
        participation_method: 'information'
      })}

      example_request "[error] Creating an idea in a project with an active information phase" do
        expect(response_status).to eq 401
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors, :base).first[:error]).to eq 'not_ideation'
      end
    end

    describe do
      let(:project_id) { nil }

      example_request "[error] Create an idea without a project" do
        expect(response_status).to be >= 400
      end
    end

    describe do
      before do
        permission = project.permissions.where(action: 'posting_idea').first
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
      end
      example_request "[error] Create an idea in a project with groups posting permission" do
        expect(response_status).to eq 401
      end
    end

    describe do
      before do
        permission = project.permissions.where(action: 'posting_idea').first
        groups = create_list(:group, 2)
        g = groups.first
        g.add_member @user
        g.save!
        permission.update!(permitted_by: 'groups', groups: groups)
      end
      example_request "Create an idea in a project with groups posting permission" do
        expect(response_status).to eq 201
      end
    end

    context "when admin" do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      describe do
        let(:project) { create(:project_with_current_phase, with_permissions: true, phases_config: {sequence: "xxcx"}) }
        let(:phase_ids) { project.phases.shuffle.take(2).map(&:id) }

        example_request "Creating an idea in specific phases" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:phases,:data).map{|d| d[:id]}).to match_array phase_ids
        end
      end

      describe do
        let(:project) { create(:project_with_active_ideation_phase, with_permissions: true) }
        let(:other_project) { create(:project_with_active_ideation_phase) }
        let(:phase_ids) { [other_project.phases.first.id] }

        example_request "[error] Creating an idea linked to a phase from a different project" do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :ideas_phases)).to eq [{error: 'invalid'}]
        end
      end
    end
  end

  patch "web_api/v1/ideas/:id" do
    before do
      @project = create(:continuous_project, with_permissions: true)
      @idea =  create(:idea, author: @user, project: @project)
    end

    with_options scope: :idea do
      parameter :project_id, "The idea of the project that hosts the idea", extra: ""
      parameter :phase_ids, "The phases the idea is part of, defaults to the current only, only allowed by admins"
      parameter :author_id, "The user id of the user owning the idea", extra: "Required if not draft"
      parameter :assignee_id, "The user id of the admin/moderator that takes ownership. Only allowed for admins/moderators."
      parameter :idea_status_id, "The status of the idea, only allowed for admins"
      parameter :publication_status, "Either #{Post::PUBLICATION_STATUSES.join(', ')}"
      parameter :title_multiloc, "Multi-locale field with the idea title", extra: "Maximum 100 characters"
      parameter :body_multiloc, "Multi-locale field with the idea body", extra: "Required if not draft"
      parameter :topic_ids, "Array of ids of the associated topics"
      parameter :area_ids, "Array of ids of the associated areas"
      parameter :location_point_geojson, "A GeoJSON point that situates the location the idea applies to"
      parameter :location_description, "A human readable description of the location the idea applies to"
      parameter :budget, "The budget needed to realize the idea, as determined by the city"
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::POSTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    let(:id) { @idea.id }
    let(:area_ids) { create_list(:area, 2).map(&:id) }
    let(:location_point_geojson) { {type: "Point", coordinates: [51.4365635, 3.825930459]} }
    let(:location_description) { "Watkins Road 8" }

    describe do
      let(:title_multiloc) { {"en" => "Changed title" } }
      let(:topic_ids) { create_list(:topic, 2, projects: [@project]).map(&:id) }

      example_request "Update an idea" do
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc,:en)).to eq "Changed title"
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
        expect(json_response.dig(:data,:attributes,:location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data,:attributes,:location_description)).to eq location_description
      end

      example "Check for the automatic creation of an upvote by the author when the publication status of an idea is updated from draft to published", document: false do
        @idea.update(publication_status: "draft")
        do_request idea: { publication_status: "published" }
        json_response = json_parse(response_body)
        new_idea = Idea.find(json_response.dig(:data, :id))
        expect(new_idea.votes.size).to eq 1
        expect(new_idea.votes[0].mode).to eq 'up'
        expect(new_idea.votes[0].user.id).to eq @user.id
        expect(json_response.dig(:data, :attributes, :upvotes_count)).to eq 1
      end
    end

    describe do
      let(:topic_ids) { [] }
      let(:area_ids) { [] }

      example "Remove the topics/areas", document: false do
        @idea.topics = create_list(:topic, 2)
        @idea.areas = create_list(:area, 2)
        do_request
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
      end
    end

    describe do
      let(:idea_status_id) { create(:idea_status).id }

      example "Change the idea status as a non-admin does not work", document: false do
        do_request
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:idea_status,:data,:id)).to eq @idea.idea_status_id
      end
    end

    describe do
      let(:assignee_id) { create(:admin).id }

      example "Changing the assignee as a non-admin does not work", document: false do
        do_request
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:assignee)).to be_nil
      end
    end

    describe do
      let(:budget) { 1800 }

      example "Change the participatory budget as a non-admin does not work", document: false do
        previous_value = @idea.budget
        do_request
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:budget)).to eq previous_value
      end
    end

    context "when admin" do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      describe do
        let(:idea_status_id) { create(:idea_status).id }

        example_request "Change the idea status (as an admin)" do
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:idea_status,:data,:id)).to eq idea_status_id
        end
      end

      describe do
        let(:assignee_id) { create(:admin).id }

        example_request "Change the assignee (as an admin)" do
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:assignee,:data,:id)).to eq assignee_id
        end
      end

      describe do
        before do
          @project = create(:project_with_phases, with_permissions: true)
          @idea.project = @project
          @idea.phases = [@project.phases.first]
          @idea.save
        end
        let(:phase_ids) { @project.phases.last(2).map(&:id) }

        example_request "Change the idea phases (as an admin or moderator)" do
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:phases,:data).map{|d| d[:id]}).to match_array phase_ids
        end
      end

      describe do
        let(:budget) { 1800 }

        example_request "Change the participatory budget (as an admin)" do
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:budget)).to eq budget
        end
      end

      describe do
        before do
          @project.update!(topics: create_list(:topic, 2))
          @project2 = create(:project, topics: [@project.topics.first])
          @idea.update!(topics: @project.topics)
        end
        let(:project_id) { @project2.id }

        example_request "Change the project (as an admin)" do
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:project,:data,:id)).to eq project_id
        end
      end
    end

    context "when moderator" do
      before do
        @moderator = create(:moderator, project: @project)
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      describe do
        let(:idea_status_id) { create(:idea_status).id }

        example_request "Change the idea status (as a moderator)" do
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:idea_status,:data,:id)).to eq idea_status_id
        end
      end

      describe do
        let(:assignee_id) { create(:admin).id }

        example_request "Change the assignee (as a moderator)" do
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:assignee,:data,:id)).to eq assignee_id
        end
      end
    end

    context "when unauthorized" do
      before do
        @user = create(:user)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      describe do
        let(:idea_status_id) { create(:idea_status).id }

        example_request "Change the idea status (unauthorized)" do
          expect(status).to eq 401
        end
      end
    end
  end

  patch "web_api/v1/ideas/:id" do
    before do
      @project = create(:continuous_project, with_permissions: true)
      @idea =  create(:idea, author: @user, publication_status: 'draft', project: @project)
    end
    parameter :publication_status, "Either #{Post::PUBLICATION_STATUSES.join(', ')}", required: true, scope: :idea

    let(:id) { @idea.id }
    let(:publication_status) { 'published' }

    example_request "Change the publication status" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:publication_status)).to eq "published"
    end
  end

  delete "web_api/v1/ideas/:id" do
    before do
      @project = create(:continuous_project, with_permissions: true)
      @idea = create(:idea_with_topics, author: @user, publication_status: 'published', project: @project)
    end
    let(:id) { @idea.id }

    example_request "Delete an idea" do
      expect(response_status).to eq 200
      expect{Idea.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      expect(@idea.project.reload.ideas_count).to eq 0
    end
  end

end
