require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Ideas" do

  before do
    header "Content-Type", "application/json"
    # @ideas = create_list(:idea, 5, publication_status: ['published','draft','published','published','spam']) #draft published closed spam
    @ideas = ['published','published','draft','published','spam','published','published'].map { |ps|  create(:idea, publication_status: ps)}
    @user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
  end

  get "web_api/v1/ideas" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of ideas per page"
    end
    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :areas, 'Filter by areas (OR)', required: false
    parameter :project, 'Filter by project', required: false
    parameter :phase, 'Filter by project phase', required: false
    parameter :author, 'Filter by author (user id)', required: false
    parameter :idea_status, 'Filter by status (idea status id)', required: false
    parameter :search, 'Filter by searching in title, body and author name', required: false
    parameter :sort, "Either 'new', '-new', 'trending', '-trending', 'popular', '-popular', 'author_name', '-author_name', 'upvotes_count', '-upvotes_count', 'downvotes_count', '-downvotes_count', 'status', '-status'", required: false
    parameter :publication_status, "Return only ideas with the specified publication status; returns all pusblished ideas by default", required: false

    example_request "List only all published ideas by default" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response[:data].map { |d| d.dig(:attributes,:publication_status) }).to all(eq 'published')
    end

    example "List all ideas which have draft set as publication status" do
      do_request(publication_status: 'draft')
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response.dig(:data,0,:attributes,:publication_status)).to eq 'draft'
    end

    example "List all ideas with a topic" do
      t1 = create(:topic)

      i1 = @ideas.first
      i1.topics << t1
      i1.save

      do_request(topics: [t1.id])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all ideas which match one of the given topics" do
      t1 = create(:topic)
      t2 = create(:topic)

      i1 = @ideas[0]
      i1.topics = [t1]
      i1.save
      i2 = @ideas[1]
      i2.topics = [t2]
      i2.save

      do_request(topics: [t1.id, t2.id])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].map{|h| h[:id]}).to match [i1.id, i2.id]
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

    example "List all ideas which match one of the given areas" do
      a1 = create(:area)
      a2 = create(:area)

      i1 = @ideas.first
      i1.areas = [a1]
      i1.save
      i2 = @ideas.second
      i2.areas = [a2]
      i2.save

      do_request(areas: [a1.id, a2.id])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].map{|h| h[:id]}).to match [i1.id, i2.id]
    end


    example "List all ideas in a project" do
      l = create(:project)
      i = create(:idea, project: l)

      do_request(project: l.id)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all ideas in a phase of a project" do
      pr = create(:project_with_phases)
      ph1 = pr.phases.first
      ph2 = pr.phases.second
      i1 = create(:idea, phases: [ph1], project: pr)
      i2 = create(:idea, phases: [ph2], project: pr)
      i3 = create(:idea, phases: [ph1, ph2], project: pr)

      do_request(phase: ph2.id)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].map{|d| d[:id]}).to match [i2.id, i3.id]
    end

    example "List all ideas with a certain status" do
      status = create(:idea_status)
      i = create(:idea, idea_status: status)

      do_request(idea_status: status.id)
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

  get "web_api/v1/ideas/as_xlsx" do
    parameter :project, 'Filter by project', required: false

    example_request "XLSX export" do
      expect(status).to eq 200
    end
  end


  get "web_api/v1/ideas/:id" do
    let(:id) {@ideas.first.id}

    example_request "Get one idea by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @ideas.first.id
    end
  end

  get "web_api/v1/ideas/by_slug/:slug" do
    let(:slug) {@ideas.first.slug}

    example_request "Get an idea by slug" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @ideas.first.id
    end

    describe do
      let(:slug) {"unexisting-idea"}
      example "get an unexisting idea by slug triggers 404", document: false do
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
      parameter :project_id, "The idea of the project that hosts the idea", extra: ""
      parameter :phase_ids, "The phases the idea is part of, defaults to the current only, only allowed by admins"
      parameter :author_id, "The user id of the user owning the idea", extra: "Required if not draft"
      parameter :idea_status_id, "The status of the idea, only allowed for admins", extra: "Defaults to status with code 'proposed'"
      parameter :publication_status, "Password", required: true, extra: "One of #{Idea::PUBLICATION_STATUSES.join(",")}"
      parameter :title_multiloc, "Multi-locale field with the idea title", required: true, extra: "Maximum 100 characters"
      parameter :body_multiloc, "Multi-locale field with the idea body", extra: "Required if not draft"
      parameter :topic_ids, "Array of ids of the associated topics"
      parameter :area_ids, "Array of ids of the associated areas"
      parameter :location_point_geojson, "A GeoJSON point that situates the location the idea applies to"
      parameter :location_description, "A human readable description of the location the idea applies to"
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
    response_field :base, "Array containing objects with signature { error: 'project_without_active_ideation_phase' }", scope: :errors


    let(:idea) { build(:idea) }
    let(:project) { create(:project) }
    let(:project_id) { project.id }
    let(:publication_status) { 'published' }
    let(:title_multiloc) { idea.title_multiloc }
    let(:body_multiloc) { idea.body_multiloc }
    let(:topic_ids) { create_list(:topic, 2).map(&:id) }
    let(:area_ids) { create_list(:area, 2).map(&:id) }
    let(:location_point_geojson) { {type: "Point", coordinates: [51.11520776293035, 3.921154106874878]} }
    let(:location_description) { "Stanley Road 4" }

    describe do

      example_request "Creating a published idea" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:project,:data, :id)).to eq project_id
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
        expect(json_response.dig(:data,:attributes,:location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data,:attributes,:location_description)).to eq location_description
        expect(project.reload.ideas_count).to eq 1
      end

      example "Check for the automatic creation of an upvote by the author when an idea is created", :document => false do

        do_request

        json_response = json_parse(response_body) 
        new_idea = Idea.find(json_response.dig(:data, :id))
        expect(new_idea.votes.size).to eq 1
        expect(new_idea.votes[0].mode).to eq 'up'
        expect(new_idea.votes[0].user.id).to eq @user.id
        expect(json_response[:data][:attributes][:upvotes_count]).to eq 1

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

    context "when admin" do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: { sub: @user.id }).token
        header 'Authorization', "Bearer #{token}"
      end

      describe do
        let (:active_phases) { create_list(:active_phase, 2, participation_method: 'ideation') }
        let (:project) { create(:project, phases: active_phases) }
        let (:phase_ids) { active_phases.map(&:id) }
        example_request "Creating an idea in specific phases" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:phases,:data).map{|d| d[:id]}).to match_array phase_ids
        end
      end

      describe do
        let (:phases) { create_list(:phase, 5, participation_method: 'information') }
        let (:project) { create(:project, phases: phases) }
        example_request "[error] Creating an idea in a project with a timeline but no active ideation phases" do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :base).first[:error]).to eq 'project_without_active_ideation_phase'
        end
      end

      describe do
        let (:project) { create(:project_with_active_ideation_phase) }
        let (:other_project) { create(:project_with_active_ideation_phase) }
        let (:phase_ids) { [other_project.phases.first.id] }
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
      @idea =  create(:idea, author: @user)
    end

    with_options scope: :idea do
      parameter :project_id, "The idea of the project that hosts the idea", extra: ""
      parameter :phase_ids, "The phases the idea is part of, defaults to the current only, only allowed by admins"
      parameter :author_id, "The user id of the user owning the idea", extra: "Required if not draft"
      parameter :idea_status_id, "The status of the idea, only allowed for admins"
      parameter :publication_status, "Either #{Idea::PUBLICATION_STATUSES.join(', ')}"
      parameter :title_multiloc, "Multi-locale field with the idea title", extra: "Maximum 100 characters"
      parameter :body_multiloc, "Multi-locale field with the idea body", extra: "Required if not draft"
      parameter :topic_ids, "Array of ids of the associated topics"
      parameter :area_ids, "Array of ids of the associated areas"
      parameter :location_point_geojson, "A GeoJSON point that situates the location the idea applies to"
      parameter :location_description, "A human readable description of the location the idea applies to"
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
    response_field :base, "Array containing objects with signature { error: 'project_without_active_ideation_phase' }", scope: :errors


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
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
        expect(json_response.dig(:data,:attributes,:location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data,:attributes,:location_description)).to eq location_description
      end

      example "Check for the automatic creation of an upvote by the author when the publication status of an idea is updated from draft to published", :document => false do
        @idea.update(publication_status: "draft")

        do_request(idea: { publication_status: "published" })

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

      example "Remove the topics/areas" do
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
    
    context "when admin" do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: { sub: @user.id }).token
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
        before do
          @project = create(:project_with_phases)
          @idea.project = @project
          @idea.phases = [@project.phases.first]
          @idea.save
        end

        let(:phase_ids) { @project.phases.last(2).map(&:id) }

        example_request "Change the idea phases (as an admin)" do
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:relationships,:phases,:data).map{|d| d[:id]}).to match_array phase_ids
        end
      end
    end
  end


  patch "web_api/v1/ideas/:id" do
    before do
      @idea =  create(:idea, author: @user, publication_status: 'draft')
    end

    parameter :publication_status, "Either #{Idea::PUBLICATION_STATUSES.join(', ')}", required: true, scope: :idea

    let(:id) { @idea.id }
    let(:publication_status) { 'published' }

    example_request "Updating a draft to a published post" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:publication_status)).to eq "published"
    end
  end

  delete "web_api/v1/ideas/:id" do
    before do
      @idea = create(:idea_with_topics, author: @user, publication_status: 'published')
    end
    let(:id) { @idea.id }
    example_request "Delete an idea" do
      expect(response_status).to eq 200
      expect{Idea.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      expect(@idea.project.reload.ideas_count).to eq 0
    end
  end


end
