require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Projects" do

  explanation "Ideas have to be posted in a city project, or they can be posted in the open idea box."

  before do
    header "Content-Type", "application/json"
  end

  context 'when admin' do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"

      @projects = ['published','published','draft','published','archived','archived','published']
        .map { |ps|  create(:project, admin_publication_attributes: {publication_status: ps})}
    end

    get "web_api/v1/projects" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of projects per page"
      end
      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :publication_statuses, "Return only projects with the specified publication statuses (i.e. given an array of publication statuses); returns all projects by default", required: false
      parameter :filter_can_moderate, "Filter out the projects the user is allowed to moderate. False by default", required: false
      parameter :folder, "Filter by folder (project folder id)", required: false
      parameter :filter_ids, "Filter out only projects with the given list of IDs", required: false

      example_request "List all projects (default behaviour)" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 7
        expect(json_response[:data].map { |d| json_response[:included].select{|x| x[:id] == d.dig(:relationships, :admin_publication, :data, :id)}.first.dig(:attributes, :publication_status) }.uniq).to match_array ['published', 'archived', 'draft']
      end

      example "List only projects with specified IDs" do
        filter_ids = [@projects.first.id, @projects.last.id]
        do_request(filter_ids: filter_ids)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:id) }).to match_array filter_ids
      end

      example "List all draft or archived projects", document: false do
        do_request(publication_statuses: ['draft','archived'])
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map { |d| json_response[:included].select{|x| x[:id] == d.dig(:relationships, :admin_publication, :data, :id)}.first.dig(:attributes, :publication_status) }).not_to include('published')
      end

      example "Get all projects on the second page with fixed page size" do
        do_request({"page[number]" => 2, "page[size]" => 2})
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end

      example "List all projects from a folder" do
        folder = create(:project_folder, projects: @projects.take(2))

        do_request folder: folder.id
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map{|d| d[:id]}).to match_array @projects.take(2).map(&:id)
      end

      example "List all top-level projects" do
        folder = create(:project_folder, projects: @projects.take(2))

        do_request folder: nil, publication_statuses: AdminPublication::PUBLICATION_STATUSES
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data].map{|d| d[:id]}).to match_array @projects.drop(2).map(&:id)
      end

      example "List all projects with an area" do
        a1 = create(:area)
        a2 = create(:area)

        p1 = @projects.first
        p1.areas << a1
        p1.save!

        p2 = @projects.last
        p2.areas << a2
        p2.save!

        do_request areas: [a1.id], publication_statuses: ['published']
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map{|d| d[:id]}).to match_array [p1.id, @projects[1].id, @projects[3].id]
      end

      example "List all projects with all given areas", document: false do
        a1 = create(:area)
        a2 = create(:area)
        a3 = create(:area)

        p1 = @projects.first
        p1.areas = [a1, a2]
        p1.save!

        p2 = @projects[1]
        p2.areas = [a2, a3]
        p2.save!

        p3 = @projects[3]
        p3.areas = [a3]
        p3.save!

        do_request areas: [a1.id, a2.id], publication_statuses: ['published']
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map{|d| d[:id]}).to match_array [p1.id, p2.id, @projects.last.id]
      end

      example "List all projects with a topic" do
        t1 = create(:topic)

        p1 = @projects.first
        p1.topics << t1
        p1.save!

        do_request topics: [t1.id], publication_statuses: ['published']
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 1
        expect(json_response[:data][0][:id]).to eq p1.id
      end

      example "List all projects with all given topics", document: false do
        t1 = create(:topic)
        t2 = create(:topic)

        p1 = @projects.first
        p1.topics = [t1, t2]
        p1.save!

        do_request topics: [t1.id, t2.id], publication_statuses: ['published']
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 1
        expect(json_response[:data][0][:id]).to eq p1.id
      end

      example "Admins can moderate all projects", document: false do
        do_request filter_can_moderate: true, publication_statuses: ['published']
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
      end
    end

    get "web_api/v1/projects/:id" do
      let(:id) { @projects.first.id }
      let!(:topic) { create(:topic, projects: [@projects.first]) }

      example_request "Get one project by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :id)).to eq @projects.first.id
        expect(json_response.dig(:data, :type)).to eq 'project'
        expect(json_response.dig(:data, :attributes)).to include(
          slug: @projects.first.slug,
          timeline_active: nil,
          action_descriptor: {
            posting_idea: {enabled: false, disabled_reason: 'project_inactive', future_enabled: nil},
            commenting_idea: {enabled: false, disabled_reason: 'project_inactive'},
            voting_idea: {enabled: false, disabled_reason: 'project_inactive'},
            comment_voting_idea: {enabled: false, disabled_reason: 'project_inactive'},
            taking_survey: {enabled: false, disabled_reason: 'project_inactive'},
            taking_poll: {enabled: false, disabled_reason: 'project_inactive'}
          },
        )
        expect(json_response.dig(:data, :relationships)).to include(
          topics: {
            data: [{id: topic.id, type: 'topic'}]
          },
          areas: {data: []},
          user_basket: {data: nil}
          )
      end

      example "Get a project with a basket", document: false do
        project = create(:continuous_budgeting_project)
        basket = create(:basket, participation_context: project, user: @user)
        do_request id: project.id
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :user_basket, :data, :id)).to eq basket.id
      end

      example "Get a project on a timeline project includes the current_phase", document: false do
        project = create(:project_with_current_phase)
        current_phase = project.phases[2]
        do_request id: project.id
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :current_phase, :data, :id)).to eq current_phase.id
        expect(json_response.dig(:included).map{|i| i[:id]}).to include(current_phase.id)
      end

      example "Get a project includes the participants_count, avatars and avatars_count", document: false do
        idea = create(:idea)
        author = idea.author
        project = idea.project
        do_request id: project.id
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :participants_count)).to eq 1
        expect(json_response.dig(:data, :attributes, :avatars_count)).to eq 1
        expect(json_response.dig(:included).map{|i| i[:id]}).to include author.id
      end
    end

    get "web_api/v1/projects/by_slug/:slug" do
      let(:slug) { @projects.first.slug }

      example_request "Get one project by slug" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @projects.first.id
      end

      describe do
        let(:slug) { "unexisting-project" }
        example "Get an unexisting project by slug", document: false do
          do_request
          expect(status).to eq 404
        end
      end
    end

    post "web_api/v1/projects" do
      with_options scope: :project do
        parameter :process_type, "The type of process used in this project. Can't be changed after. One of #{Project::PROCESS_TYPES.join(",")}. Defaults to timeline"
        parameter :title_multiloc, "The title of the project, as a multiloc string", required: true
        parameter :description_multiloc, "The description of the project, as a multiloc HTML string", required: true
        parameter :description_preview_multiloc, "The description preview of the project, as a multiloc string"
        parameter :slug, "The unique slug of the project. If not given, it will be auto generated"
        parameter :header_bg, "Base64 encoded header image"
        parameter :area_ids, "Array of ids of the associated areas"
        parameter :topic_ids, "Array of ids of the associated topics"
        parameter :visible_to, "Defines who can see the project, either #{Project::VISIBLE_TOS.join(",")}. Defaults to public.", required: false
        parameter :participation_method, "Only for continuous projects. Either #{ParticipationContext::PARTICIPATION_METHODS.join(",")}. Defaults to ideation.", required: false
        parameter :posting_enabled, "Only for continuous projects. Can citizens post ideas in this project? Defaults to true", required: false
        parameter :commenting_enabled, "Only for continuous projects. Can citizens post comment in this project? Defaults to true", required: false
        parameter :voting_enabled, "Only for continuous projects. Can citizens vote in this project? Defaults to true", required: false
        parameter :downvoting_enabled, "Only for continuous projects. Can citizens downvote in this project? Defaults to true", required: false
        parameter :voting_method, "Only for continuous projects with voting enabled. How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(",")}. Defaults to unlimited", required: false
        parameter :voting_limited_max, "Only for continuous projects with limited voting. Number of votes a citizen can perform in this project. Defaults to 10", required: false
        parameter :survey_embed_url, "The identifier for the survey from the external API, if participation_method is set to survey", required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyParticipationContext::SURVEY_SERVICES.join(",")}", required: false
        parameter :max_budget, "The maximal budget amount each citizen can spend during participatory budgeting.", required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{ParticipationContext::PRESENTATION_MODES.join(",")}. Defaults to card.", required: false
        parameter :default_assignee_id, "The user id of the admin or moderator that gets assigned to ideas by default. Defaults to unassigned", required: false
        parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", required: false
        parameter :folder_id, "The ID of the project folder (can be set to nil for top-level projects)", required: false
        parameter :ideas_order, 'The default order of ideas.'
        parameter :input_term, 'The input term for posts.'
      end
      with_options scope: [:project, :admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the project, either #{AdminPublication::PUBLICATION_STATUSES.join(",")}. Defaults to published.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Project)

      describe do
        before do
          create(:topic, code: 'nature', ordering: 0)
          create(:topic, code: 'safety', ordering: 2)
          create(:topic, code: 'mobility', ordering: 1)
        end
        let(:project) { build(:project) }
        let(:title_multiloc) { project.title_multiloc }
        let(:description_multiloc) { project.description_multiloc }
        let(:description_preview_multiloc) { project.description_preview_multiloc }
        let(:header_bg) { encode_image_as_base64("header.jpg")}
        let(:area_ids) { create_list(:area, 2).map(&:id) }
        let(:visible_to) { 'admins' }
        let(:publication_status) { 'draft' }
        let(:default_assignee_id) { create(:admin).id }

        example_request "Create a timeline project" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:process_type)).to eq 'timeline'
          expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data,:attributes,:description_preview_multiloc).stringify_keys).to match description_preview_multiloc
          expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
          expect(json_response.dig(:data,:attributes,:visible_to)).to eq 'admins'
          expect(json_response[:included].select{|inc| inc[:type] == 'admin_publication'}.first.dig(:attributes, :publication_status)).to eq 'draft'
          expect(json_response.dig(:data,:relationships,:default_assignee,:data,:id)).to eq default_assignee_id
          expect(json_response.dig(:data,:attributes,:header_bg)).to be_present
          # New projects are added to the top
          expect(json_response[:included].select{|inc| inc[:type] == 'admin_publication'}.first.dig(:attributes, :ordering)).to eq 0
          expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array Topic.defaults.ids
          expect(ProjectsTopic.where(project_id: json_response.dig(:data,:id)).order('projects_topics.ordering').pluck(:topic_id)).to eq Topic.defaults.order(:ordering).ids
        end

        example "Create a project in a folder" do
          folder = create(:project_folder)
          do_request folder_id: folder.id
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          # New folder projects are added to the top
          expect(json_response[:included].select{|inc| inc[:type] == 'admin_publication'}.first.dig(:attributes, :ordering)).to eq 0
        end
      end

      describe do
        let(:project) { build(:continuous_project) }
        let(:title_multiloc) { project.title_multiloc }
        let(:description_multiloc) { project.description_multiloc }
        let(:description_preview_multiloc) { project.description_preview_multiloc }
        let(:header_bg) { encode_image_as_base64("header.jpg")}
        let(:area_ids) { create_list(:area, 2).map(&:id) }
        let(:visible_to) { 'admins' }
        let(:process_type) { project.process_type }
        let(:participation_method) { project.participation_method }
        let(:presentation_mode){ 'map' }
        let(:posting_enabled) { project.posting_enabled }
        let(:commenting_enabled) { project.commenting_enabled }
        let(:voting_enabled) { project.voting_enabled }
        let(:voting_method) { project.voting_method }
        let(:voting_limited_max) { project.voting_limited_max }
        let(:ideas_order) { 'new' }

        example_request "Create a continuous project" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:process_type)).to eq process_type
          expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data,:attributes,:description_preview_multiloc).stringify_keys).to match description_preview_multiloc
          expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
          expect(json_response.dig(:data,:attributes,:visible_to)).to eq visible_to
          expect(json_response.dig(:data,:attributes,:participation_method)).to eq participation_method
          expect(json_response.dig(:data,:attributes,:presentation_mode)).to eq presentation_mode
          expect(json_response.dig(:data,:attributes,:posting_enabled)).to eq posting_enabled
          expect(json_response.dig(:data,:attributes,:commenting_enabled)).to eq commenting_enabled
          expect(json_response.dig(:data,:attributes,:voting_enabled)).to eq voting_enabled
          expect(json_response.dig(:data,:attributes,:downvoting_enabled)).to eq true
          expect(json_response.dig(:data,:attributes,:voting_method)).to eq voting_method
          expect(json_response.dig(:data,:attributes,:voting_limited_max)).to eq voting_limited_max
          expect(json_response.dig(:data,:attributes,:ideas_order)).to be_present
          expect(json_response.dig(:data,:attributes,:ideas_order)).to eq 'new'
          expect(json_response.dig(:data,:attributes,:input_term)).to be_present
          expect(json_response.dig(:data,:attributes,:input_term)).to eq 'idea'
        end

        context 'when not admin' do
          before do
            @user.update(roles: [])
          end
          let(:presentation_mode) { 'map' }

          example_request "[error] Create a project", document: false do
            expect(response_status).to eq 401
          end
        end

        describe do
          let(:slug) { 'this-is-taken' }

          example "[error] Create an invalid project", document: false do
            create(:project, slug: 'this-is-taken')
            do_request
            expect(response_status).to eq 422
            json_response = json_parse(response_body)
            expect(json_response.dig(:errors,:slug)).to eq [{:error=>"taken", :value=>"this-is-taken"}]
          end
        end

        describe do
          let(:description_multiloc) {{
            'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
          }}

          example "Create a project with text image", document: false do
            ti_count = TextImage.count
            do_request
            expect(response_status).to eq 201
            expect(TextImage.count).to eq (ti_count + 1)
          end

          example "[error] Create a project with text image without title", document: false do
            ti_count = TextImage.count
            do_request project: {title_multiloc: nil}

            expect(response_status).to eq 422
            json_response = json_parse(response_body)
            expect(json_response[:errors][:title_multiloc]).to be_present
            expect(TextImage.count).to eq ti_count
          end
        end
      end
    end

    patch "web_api/v1/projects/:id" do
      before do
        @project = create(:project, process_type: 'continuous')
      end
      with_options scope: :project do
        parameter :title_multiloc, "The title of the project, as a multiloc string", required: true
        parameter :description_multiloc, "The description of the project, as a multiloc HTML string", required: true
        parameter :description_preview_multiloc, "The description preview of the project, as a multiloc string"
        parameter :slug, "The unique slug of the project"
        parameter :header_bg, "Base64 encoded header image"
        parameter :area_ids, "Array of ids of the associated areas"
        parameter :topic_ids, "Array of ids of the associated topics"
        parameter :visible_to, "Defines who can see the project, either #{Project::VISIBLE_TOS.join(",")}.", required: false
        parameter :participation_method, "Only for continuous projects. Either #{ParticipationContext::PARTICIPATION_METHODS.join(",")}.", required: false
        parameter :posting_enabled, "Only for continuous projects. Can citizens post ideas in this project?", required: false
        parameter :commenting_enabled, "Only for continuous projects. Can citizens post comment in this project?", required: false
        parameter :voting_enabled, "Only for continuous projects. Can citizens vote in this project?", required: false
        parameter :downvoting_enabled, "Only for continuous projects. Can citizens downvote in this project?", required: false
        parameter :voting_method, "Only for continuous projects with voting enabled. How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(",")}.", required: false
        parameter :voting_limited_max, "Only for continuous projects with limited voting. Number of votes a citizen can perform in this project.", required: false
        parameter :survey_embed_url, "The identifier for the survey from the external API, if participation_method is set to survey", required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyParticipationContext::SURVEY_SERVICES.join(",")}", required: false
        parameter :max_budget, "The maximal budget amount each citizen can spend during participatory budgeting.", required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{Project::PRESENTATION_MODES.join(",")}.", required: false
        parameter :default_assignee_id, "The user id of the admin or moderator that gets assigned to ideas by default. Set to null to default to unassigned", required: false
        parameter :poll_anonymous, "Are users associated with their answer? Only applies if participation_method is 'poll'. Can't be changed after first answer.", required: false
        parameter :folder_id, "The ID of the project folder (can be set to nil for top-level projects)"
        parameter :ideas_order, 'The default order of ideas.'
      end
      with_options scope: [:project, :admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the project, either #{AdminPublication::PUBLICATION_STATUSES.join(",")}.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Project)

      let(:id) { @project.id }
      let(:title_multiloc) { {"en" => "Changed title" } }
      let(:description_multiloc) { {"en" => "Changed body" } }
      let(:description_preview_multiloc) { @project.description_preview_multiloc }
      let(:slug) { "changed-title" }
      let(:header_bg) { encode_image_as_base64("header.jpg")}
      let(:area_ids) { create_list(:area, 2).map(&:id) }
      let(:visible_to) { 'groups' }
      let(:presentation_mode) { 'card' }
      let(:publication_status) { 'archived' }
      let(:default_assignee_id) { create(:admin).id }
      let(:ideas_order) { 'new' }

      example "Update a project" do
        old_publcation_ids = AdminPublication.ids
        do_request

        expect(response_status).to eq 200
        # admin publications should not be replaced, but rather should be updated
        expect(AdminPublication.ids).to match_array old_publcation_ids
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc,:en)).to eq "Changed title"
        expect(json_response.dig(:data,:attributes,:description_multiloc,:en)).to eq "Changed body"
        expect(json_response.dig(:data,:attributes,:description_preview_multiloc).stringify_keys).to match description_preview_multiloc
        expect(json_response.dig(:data,:attributes,:slug)).to eq "changed-title"
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
        expect(json_response.dig(:data,:attributes,:visible_to)).to eq 'groups'
        expect(json_response.dig(:data,:attributes,:ideas_order)).to be_present
        expect(json_response.dig(:data,:attributes,:ideas_order)).to eq 'new'
        expect(json_response.dig(:data,:attributes,:input_term)).to be_present
        expect(json_response.dig(:data,:attributes,:input_term)).to eq 'idea'
        expect(json_response.dig(:data,:attributes,:presentation_mode)).to eq 'card'
        expect(json_response[:included].select{|inc| inc[:type] == 'admin_publication'}.first.dig(:attributes, :publication_status)).to eq 'archived'
        expect(json_response.dig(:data,:relationships,:default_assignee,:data,:id)).to eq default_assignee_id
      end

      example "Add a project to a folder" do
        folder = create(:project_folder)
        do_request(project: {folder_id: folder.id})
        json_response = json_parse(response_body)
        # expect(json_response.dig(:data,:relationships,:folder,:data,:id)).to eq folder.id
        expect(Project.find(json_response.dig(:data,:id)).folder.id).to eq folder.id
        # Projects moved into folders are added to the top
        expect(json_response[:included].select{|inc| inc[:type] == 'admin_publication'}.first.dig(:attributes, :ordering)).to eq 0
      end

      example "Remove a project from a folder" do
        folder = create(:project_folder, projects: [@project])
        do_request(project: {folder_id: nil})
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:folder,:data,:id)).to eq nil
        # Projects moved out of folders are added to the top
        expect(json_response[:included].select{|inc| inc[:type] == 'admin_publication'}.first.dig(:attributes, :ordering)).to eq 0
      end

      example "[error] Put a project in a non-existing folder" do
        do_request(project: {folder_id: 'dinosaur'})
        expect(response_status).to eq 404
      end

      example "Clear all areas", document: false do
        do_request(project: {area_ids: []})
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:areas,:data).size).to eq 0
      end

      example "Set default assignee to unassigned", document: false do
        @project.update!(default_assignee: create(:admin))
        do_request(project: {default_assignee_id: nil})
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:default_assignee,:data,:id)).to be_nil
      end

      example "Disable downvoting", document: false do
        configuration = AppConfiguration.instance
        configuration.settings['disable_downvoting'] = {'allowed' => true, 'enabled' => true}
        configuration.save!
        do_request(project: {downvoting_enabled: false})
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:downvoting_enabled)).to eq false
      end

      example "Disable downvoting when feature is not enabled", document: false do
        configuration = AppConfiguration.instance
        configuration.settings['disable_downvoting'] = {'allowed' => false, 'enabled' => false}
        configuration.save!
        do_request(project: {downvoting_enabled: false})
        expect(@project.reload.downvoting_enabled).to eq true
      end

      describe do
        example "The header image can be removed" do
          @project.update(header_bg: Rails.root.join("spec/fixtures/header.jpg").open)
          expect(@project.reload.header_bg_url).to be_present
          do_request project: {header_bg: nil}
          expect(@project.reload.header_bg_url).to be nil
        end
      end
    end

    delete "web_api/v1/projects/:id" do
      let(:project) { create(:project) }
      let(:id) { project.id }
      example "Delete a project" do
        moderator = create(:moderator, project: project)
        expect(moderator.project_moderator? id).to be true
        do_request
        expect(response_status).to eq 200
        expect{Project.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(moderator.reload.project_moderator? id).to be false
      end
    end
  end

  get "web_api/v1/projects" do
    context "when moderator" do
      before do
        @project = create(:project)
        @moderator = create(:moderator, project: @project)
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"

        @projects = create_list(:project, 10, admin_publication_attributes: {publication_status: 'published'})
      end

      example "List all projects the current user can moderate" do
        n_moderating_projects = 3
        pj1, pj2 = @projects.shuffle.take 2
        @projects.shuffle.take(n_moderating_projects).each do |pj|
          @moderator.add_role 'project_moderator', project_id: pj.id
        end
        @moderator.save!

        do_request filter_can_moderate: true
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq n_moderating_projects + 1
      end
    end

    context 'when admin' do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"

        @projects = ['published','published','draft','published','archived','published','archived']
          .map { |ps|  create(:project, admin_publication_attributes: {publication_status: ps})}
      end

      example "Admins moderate all projects", document: false do
        do_request filter_can_moderate: true, publication_statuses: AdminPublication::PUBLICATION_STATUSES
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq @projects.size
      end
    end

    context 'when non-moderator/non-admin user' do
      before do
        @user = create(:user, roles: [])
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      example "Get projects with access rights" do
        project = create(:project)
        do_request
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 1
      end

      example "Normal users cannot moderate any projects", document: false do
        ['published','published','draft','published','archived','published','archived']
          .map {|ps|  create(:project, admin_publication_attributes: {publication_status: ps})}
        do_request(filter_can_moderate: true, publication_statuses: AdminPublication::PUBLICATION_STATUSES)
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 0
      end
    end
  end

  context "when not logged in" do
    get "web_api/v1/projects" do
      parameter :filter_can_moderate, "Filter out the projects the user is allowed to moderate. False by default", required: false
      before do
        @projects = create_list(:project, 10, admin_publication_attributes: {publication_status: 'published'})
      end
      let(:filter_can_moderate) {true}

      example_request "List all projects the current user can moderate", document: false do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 0
      end
    end
  end
end

def encode_image_as_base64 filename
  "data:image/png;base64,#{Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))}"
end
