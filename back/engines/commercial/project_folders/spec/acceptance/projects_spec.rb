require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects' do
  explanation 'Ideas have to be posted in a city project, or they can be posted in the open idea box.'

  before do
    header 'Content-Type', 'application/json'
    header_token_for(user)
  end

  context 'as a project folder moderator' do
    let!(:project_folder) { create(:project_folder) }
    let!(:user) { create(:project_folder_moderator, project_folder: project_folder) }
    let!(:projects_within_folder) do
      projects = publication_statuses.map do |status|
        create(
          :project,
          admin_publication_attributes: {
            publication_status: status,
            parent_id: project_folder.admin_publication.id
          }
        )
      end
      Project.includes(:admin_publication).where(projects: { id: projects.pluck(:id) })
    end

    let!(:projects_outside_of_folder) do
      projects = publication_statuses.map do |status|
        create(
          :project,
          admin_publication_attributes: {
            publication_status: status
          }
        )
      end
      Project.includes(:admin_publication).where(projects: { id: projects.pluck(:id) })
    end

    let(:publication_statuses) { AdminPublication::PUBLICATION_STATUSES }

    get 'web_api/v1/projects' do
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

      example_request 'Lists projects that belong to a folder the user moderates' do
        expect(status).to eq(200)

        json_response = json_parse(response_body)
        ids = json_response[:data].map { |project| project[:id] }
        projects = Project.includes(:admin_publication)
                          .where(admin_publications: { publication_status: %w[published archived] })
                          .where(projects: { visible_to: 'public' })
                          .or(projects_within_folder)

        expect(ids).to match_array projects.pluck(:id)
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
        parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", required: false
        parameter :folder_id, "The ID of the project folder (can be set to nil for top-level projects)", required: false
        parameter :ideas_order, 'The default order of ideas.'
      end

      with_options scope: [:project, :admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the project, either #{AdminPublication::PUBLICATION_STATUSES.join(",")}. Defaults to published.", required: false
      end

      ValidationErrorHelper.new.error_fields(self, Project)

      describe do
        let(:project) { build(:project) }
        let(:title_multiloc) { project.title_multiloc }
        let(:description_multiloc) { project.description_multiloc }
        let(:description_preview_multiloc) { project.description_preview_multiloc }
        let(:header_bg) { encode_image_as_base64("header.jpg")}
        let(:area_ids) { create_list(:area, 2).map(&:id) }
        let(:visible_to) { 'admins' }
        let(:publication_status) { 'draft' }
        let!(:other_folder_moderators) { create_list(:project_folder_moderator, 3, project_folder: project_folder) }
        let(:last_project) { Project.order(created_at: :desc).take }

        context 'when passing a folder_id of a folder the user moderates' do
          let(:folder_id) { project_folder.id }

          example_request 'Allows the creation of a project within a folder the user moderates' do
            expect(response_status).to eq 201

            json_response                    = json_parse(response_body)
            response_resource_id             = json_response.dig(:data, :id)
            admin_publication_ordering       = last_project.admin_publication.ordering
            admin_publication_parent         = last_project.admin_publication.parent

            expect(response_resource_id).to eq last_project.id
            expect(admin_publication_ordering).to eq 0
            expect(admin_publication_parent).to eq project_folder.admin_publication
          end

          example_request 'Adds all folder moderators as moderators of the project' do
            expect(response_status).to eq 201

            json_response              = json_parse(response_body)
            response_resource_id       = json_response.dig(:data, :id)
            project_moderators         = User.project_moderator(response_resource_id)
            folder_moderators          = User.project_folder_moderator(project_folder.id)

            expect(project_moderators.pluck(:id)).to match_array folder_moderators.pluck(:id)
          end
        end

        context 'when passing a folder_id of a folder the user does not moderate' do
          let(:folder_id) { create(:project_folder).id }

          example_request 'It does not authorize the folder moderator' do
            expect(response_status).to eq 401
          end
        end
      end
    end

    patch 'web_api/v1/projects/:id' do
      describe do
        let!(:project) { create(:project) }

        let(:id) { project.id }

        example_request 'It does not authorize the folder moderator' do
          expect(response_status).to eq 401
        end
      end
    end

    delete 'web_api/v1/projects/:id' do
      describe do
        let!(:project) { create(:project) }

        let(:id) { project.id }

        example_request 'It does not authorize the folder moderator' do
          expect(response_status).to eq 401
        end
      end
    end
  end

  context 'as an admin' do
    let!(:project_folder) { create(:project_folder) }
    let!(:user) { create(:admin) }

    patch 'web_api/v1/projects/:id' do
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
        parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", required: false
        parameter :folder_id, "The ID of the project folder (can be set to nil for top-level projects)", required: false
        parameter :ideas_order, 'The default order of ideas.'
      end

      with_options scope: [:project, :admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the project, either #{AdminPublication::PUBLICATION_STATUSES.join(",")}. Defaults to published.", required: false
      end

      ValidationErrorHelper.new.error_fields(self, Project)

      describe do
        let!(:project) { create(:project) }
        let!(:old_folder_moderators) { create_list(:project_folder_moderator, 3, project_folder: project_folder) }

        let(:id) { project.id }
        let(:title_multiloc) { project.title_multiloc }
        let(:description_multiloc) { project.description_multiloc }
        let(:description_preview_multiloc) { project.description_preview_multiloc }
        let(:header_bg) { encode_image_as_base64("header.jpg")}
        let(:area_ids) { create_list(:area, 2).map(&:id) }
        let(:visible_to) { 'admins' }
        let(:publication_status) { 'draft' }

        before do
          project.folder = project_folder
          project.save
        end

        context 'when a valid folder_id is passed' do
          let!(:new_folder) { create(:project_folder) }
          let!(:new_folder_moderators) { create_list(:project_folder_moderator, 3, project_folder: new_folder) }
          let(:project_moderators) { User.project_moderator(project.id) }

          let(:folder_id) { new_folder.id }

          example_request 'Allows changing the project from one folder to another' do
            expect(response_status).to eq 200

            json_response              = json_parse(response_body)
            response_resource_id       = json_response.dig(:data, :id)
            admin_publication_parent   = project.reload.admin_publication.parent

            expect(response_resource_id).to eq project.id
            expect(admin_publication_parent).to eq new_folder.admin_publication
          end

          example_request 'Removes old folder moderators and adds new folder moderators' do
            expect(response_status).to eq 200

            expect(project_moderators.pluck(:id)).not_to match_array old_folder_moderators.pluck(:id)
            expect(project_moderators.pluck(:id)).to match_array new_folder_moderators.pluck(:id)
          end
        end

        context 'when an invalid folder_id is passed' do
          let!(:new_folder) { create(:project_folder) }
          let!(:new_folder_moderators) { create_list(:project_folder_moderator, 3, project_folder: new_folder) }
          let(:project_moderators) { User.project_moderator(project.id) }

          let(:folder_id) { 'foo' }

          example_request 'It should return a 404 not found error' do
            expect(response_status).to eq 404
          end
        end
      end
    end
  end
end

def encode_image_as_base64(filename)
  "data:image/png;base64,#{Base64.encode64(File.read(Rails.root.join('spec', 'fixtures', filename)))}"
end
