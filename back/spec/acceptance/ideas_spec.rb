# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  before { header 'Content-Type', 'application/json' }

  context 'when visitor' do
    post 'web_api/v1/ideas' do
      with_options scope: :idea do
        parameter :project_id, 'The identifier of the project that hosts the idea', required: true
        parameter :phase_ids, 'The phases the idea is part of, defaults to the current only, only allowed by admins'
        parameter :author_id, 'The user id of the user owning the idea', extra: 'Required if not draft'
        parameter :idea_status_id, 'The status of the idea, only allowed for admins', extra: "Defaults to status with code 'proposed'"
        parameter :publication_status, 'Publication status', required: true, extra: "One of #{Post::PUBLICATION_STATUSES.join(',')}"
        parameter :title_multiloc, 'Multi-locale field with the idea title', required: true, extra: 'Maximum 100 characters'
        parameter :body_multiloc, 'Multi-locale field with the idea body', extra: 'Required if not draft'
        parameter :topic_ids, 'Array of ids of the associated topics'
        parameter :location_point_geojson, 'A GeoJSON point that situates the location the idea applies to'
        parameter :location_description, 'A human readable description of the location the idea applies to'
        parameter :proposed_budget, 'The budget needed to realize the idea, as proposed by the author'
        parameter :budget, 'The budget needed to realize the idea, as determined by the city'
        parameter :idea_images_attributes, 'an array of base64 images to create'
        parameter :idea_files_attributes, 'an array of base64 files to create'
      end
      ValidationErrorHelper.new.error_fields self, Idea
      response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::POSTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      let(:idea) { build(:idea) }
      let(:project) { create(:continuous_project) }
      let(:project_id) { project.id }
      let(:publication_status) { 'published' }
      let(:title_multiloc) { idea.title_multiloc }
      let(:body_multiloc) { idea.body_multiloc }

      describe do
        let(:author_id) { nil }

        example '[error] Create an idea without author', document: false do
          do_request
          assert_status 401
        end
      end
    end
  end

  context 'when resident' do
    let(:user) { create(:user) }

    before do
      @user = user
      create(:idea_status_proposed)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    get 'web_api/v1/ideas' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of ideas per page'
      end
      parameter :topics, 'Filter by topics (OR)', required: false
      parameter :projects, 'Filter by projects (OR)', required: false
      parameter :phase, 'Filter by project phase', required: false
      parameter :author, 'Filter by author (user id)', required: false
      parameter :idea_status, 'Filter by status (idea status id)', required: false
      parameter :search, 'Filter by searching in title and body', required: false
      parameter :sort, "Either 'new', '-new', 'trending', '-trending', 'popular', '-popular', 'author_name', '-author_name', 'upvotes_count', '-upvotes_count', 'downvotes_count', '-downvotes_count', 'status', '-status', 'baskets_count', '-baskets_count', 'random'", required: false
      parameter :publication_status, 'Filter by publication status; returns all published ideas by default', required: false
      parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}", required: false
      parameter :feedback_needed, 'Filter out ideas that need feedback', required: false
      parameter :filter_trending, 'Filter out truly trending ideas', required: false

      describe do
        before do
          @ideas = %w[published published draft published spam published published].map do |ps|
            create :idea, publication_status: ps
          end
          create :idea, project: create(:continuous_native_survey_project)
        end

        example_request 'List all published ideas (default behaviour)' do
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].map { |d| d.dig(:attributes, :publication_status) }).to all(eq 'published')
        end

        example 'Don\'t list drafts (default behaviour)', document: false do
          do_request publication_status: 'draft'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 0
        end

        example 'List all ideas for a topic' do
          t1 = create(:topic)

          i1 = @ideas.first
          i1.project.update!(allowed_input_topics: Topic.all)
          i1.topics << t1
          i1.save!

          do_request topics: [t1.id]
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i1.id
        end

        example 'List all ideas for a topic with other filters enabled', document: false do
          t1 = create(:topic)

          i1 = @ideas.first
          i1.project.update!(allowed_input_topics: Topic.all)
          i1.topics << t1
          i1.save!

          do_request topics: [t1.id], sort: 'random'
          expect(status).to eq(200)
        end

        example 'List all ideas which match one of the given topics', document: false do
          t1 = create(:topic)
          t2 = create(:topic)
          t3 = create(:topic)

          i1 = @ideas[0]
          i1.project.update!(allowed_input_topics: Topic.all)
          i1.topics = [t1, t3]
          i1.save!
          i2 = @ideas[1]
          i2.project.update!(allowed_input_topics: Topic.all)
          i2.topics = [t2]
          i2.save!
          i3 = @ideas[3]
          i3.project.update!(allowed_input_topics: Topic.all)
          i3.topics = [t3, t1, t2]
          i3.save!

          do_request topics: [t1.id, t2.id]
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].pluck(:id)).to match_array [i1.id, i2.id, i3.id]
        end

        example 'List all ideas in a project' do
          l = create(:continuous_project)
          i = create(:idea, project: l)

          do_request projects: [l.id]

          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i.id
        end

        example 'List all ideas in any of the given projects', document: false do
          i1 = create(:idea)
          i2 = create(:idea)

          do_request projects: [i1.project.id, i2.project.id]

          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].pluck(:id)).to match_array [i1.id, i2.id]
        end

        example 'List all ideas in a phase of a project' do
          pr = create(:project_with_phases)
          ph1 = pr.phases.first
          ph2 = pr.phases.second
          ideas = [
            create(:idea, phases: [ph1], project: pr),
            create(:idea, phases: [ph2], project: pr),
            create(:idea, phases: [ph1, ph2], project: pr)
          ]

          do_request phase: ph2.id
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].pluck(:id)).to match_array [ideas[1].id, ideas[2].id]
        end

        example 'List all ideas in published projects' do
          idea = create(:idea, project: create(:project, admin_publication_attributes: { publication_status: 'archived' }))
          do_request(project_publication_status: 'published')
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].pluck(:id)).not_to include(idea.id)
        end

        example 'List all ideas for an idea status' do
          status = create(:idea_status)
          i = create(:idea, idea_status: status)

          do_request idea_status: status.id
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i.id
        end

        example 'List all ideas for a user' do
          u = create(:user)
          i = create(:idea, author: u)

          do_request author: u.id
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i.id
        end

        example 'List all ideas that need feedback' do
          proposed = create(:idea_status_proposed)
          i = create(:idea, idea_status: proposed)

          do_request feedback_needed: true
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i.id
        end

        example 'Search for ideas' do
          initiatives = [
            create(:idea, title_multiloc: { en: 'This idea is uniqque' }),
            create(:idea, title_multiloc: { en: 'This one origiinal' })
          ]

          do_request search: 'uniqque'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq initiatives[0].id
        end

        example 'List all ideas sorted by new' do
          i1 = create(:idea)

          do_request sort: 'new'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 6
          expect(json_response[:data][0][:id]).to eq i1.id
        end

        example 'List all ideas by random ordering', document: false do
          create(:idea)

          do_request sort: 'random'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 6
        end

        example 'List all ideas includes the user_vote', document: false do
          vote = create(:vote, user: @user)

          do_request
          json_response = json_parse(response_body)
          expect(json_response[:data].filter_map { |d| d[:relationships][:user_vote][:data] }.first[:id]).to eq vote.id
          expect(json_response[:included].pluck(:id)).to include vote.id
        end

        example 'Search for ideas should work with trending ordering', document: false do
          i1 = Idea.first
          i1.title_multiloc['nl-BE'] = 'Park met blauwe bomen'
          i1.title_multiloc['en'] = 'A park with orange grass'
          i1.save!

          do_request search: 'Park', sort: 'trending'
          expect(status).to eq(200)
        end

        example 'Default trending ordering', document: false do
          do_request project_publication_status: 'published', sort: 'trending'
          expect(status).to eq(200)
        end
      end
    end

    get 'web_api/v1/ideas/as_markers' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of ideas per page'
      end
      parameter :topics, 'Filter by topics (OR)', required: false
      parameter :projects, 'Filter by projects (OR)', required: false
      parameter :phase, 'Filter by project phase', required: false
      parameter :author, 'Filter by author (user id)', required: false
      parameter :idea_status, 'Filter by status (idea status id)', required: false
      parameter :search, 'Filter by searching in title and body', required: false
      parameter :publication_status, 'Return only ideas with the specified publication status; returns all pusblished ideas by default', required: false
      parameter :bounding_box, 'Given an [x1,y1,x2,y2] array of doubles (x being latitude and y being longitude), the idea markers are filtered to only retain those within the (x1,y1)-(x2,y2) box.', required: false
      parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}", required: false
      parameter :feedback_needed, 'Filter out ideas that need feedback', required: false
      parameter :filter_trending, 'Filter out truly trending ideas', required: false

      describe do
        before do
          locations = [[51.044039, 3.716964], [50.845552, 4.357355], [50.640255, 5.571848], [50.950772, 4.308304], [51.215929, 4.422602], [50.453848, 3.952217], [-27.148983, -109.424659]]
          placenames = ['Ghent', 'Brussels', 'Liège', 'Meise', 'Antwerp', 'Mons', 'Hanga Roa']
          @ideas = locations.zip(placenames).map do |location, placename|
            create(
              :idea,
              location_point_geojson: { 'type' => 'Point', 'coordinates' => location },
              title_multiloc: { 'en' => placename }
            )
          end
        end

        example 'List all idea markers within a bounding box' do
          do_request(bounding_box: '[51.208758,3.224363,50.000667,5.715281]') # Bruges-Bastogne

          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].map { |d| d.dig(:attributes, :title_multiloc, :en) }.sort).to match %w[Ghent Brussels Liège Meise Mons].sort
        end

        example 'List all idea markers in a phase of a project', document: false do
          pr = create(:project_with_phases)
          ph1 = pr.phases.first
          ph2 = pr.phases.second
          create(:idea, phases: [ph1], project: pr)
          i2 = create(:idea, phases: [ph2], project: pr)
          i3 = create(:idea, phases: [ph1, ph2], project: pr)

          do_request phase: ph2.id
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].pluck(:id)).to match_array [i2.id, i3.id]
        end
      end
    end

    get 'web_api/v1/ideas/as_xlsx' do
      parameter :project, 'Filter by project', required: false
      parameter :ideas, 'Filter by a given list of idea ids', required: false

      describe do
        before do
          @user = create(:admin)
          token = Knock::AuthToken.new(payload: @user.to_token_payload).token
          header 'Authorization', "Bearer #{token}"

          @ideas = %w[published published draft published spam published published].map do |ps|
            create :idea, publication_status: ps
          end
        end

        example_request 'XLSX export' do
          expect(status).to eq 200
        end

        describe do
          before do
            @project = create(:continuous_project)
            @selected_ideas = @ideas.select(&:published?).shuffle.take 3
            @selected_ideas.each do |idea|
              idea.update! project: @project
            end
          end

          let(:project) { @project.id }

          example_request 'XLSX export by project' do
            expect(status).to eq 200
            worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
            expect(worksheet.count).to eq(@selected_ideas.size + 1)
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
            expect(worksheet.count).to eq(@selected_ideas.size + 1)
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
    end

    get 'web_api/v1/ideas/filter_counts' do
      describe do
        before do
          @t1 = create(:topic)
          @t2 = create(:topic)
          @project = create(:continuous_project, allowed_input_topics: [@t1, @t2])

          @s1 = create(:idea_status)
          @s2 = create(:idea_status)
          @i1 = create(:idea, project: @project, topics: [@t1, @t2], idea_status: @s1)
          @i2 = create(:idea, project: @project, topics: [@t1], idea_status: @s2)
          @i3 = create(:idea, project: @project, topics: [@t2], idea_status: @s2)
          @i4 = create(:idea, project: @project, topics: [], idea_status: @s2)
          create(:idea, topics: [@t1, @t2], idea_status: @s1, project: create(:project, allowed_input_topics: [@t1, @t2]))

          # a1 -> 3
          # a2 -> 1
          # t1 -> 2
          # t2 -> 2
          # s1 -> 1
          # s2 -> 3
        end

        parameter :topics, 'Filter by topics (OR)', required: false
        parameter :projects, 'Filter by projects (OR)', required: false
        parameter :phase, 'Filter by project phase', required: false
        parameter :author, 'Filter by author (user id)', required: false
        parameter :idea_status, 'Filter by status (idea status id)', required: false
        parameter :search, 'Filter by searching in title and body', required: false
        parameter :publication_status, 'Return only ideas with the specified publication status; returns all pusblished ideas by default', required: false
        parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}", required: false
        parameter :feedback_needed, 'Filter out ideas that need feedback', required: false
        parameter :filter_trending, 'Filter out truly trending ideas', required: false

        let(:projects) { [@project.id] }

        example_request 'List idea counts per filter option' do
          expect(status).to eq 200
          json_response = json_parse(response_body)

          expect(json_response[:idea_status_id][@s1.id.to_sym]).to eq 1
          expect(json_response[:idea_status_id][@s2.id.to_sym]).to eq 3
          expect(json_response[:topic_id][@t1.id.to_sym]).to eq 2
          expect(json_response[:topic_id][@t2.id.to_sym]).to eq 2
          expect(json_response[:total]).to eq 4
        end

        example 'List idea counts per filter option on topic' do
          do_request topics: [@t1.id], projects: nil
          expect(status).to eq 200
        end

        example 'List idea counts per filter option with a search string' do
          do_request search: 'trees'
          expect(status).to eq 200
        end
      end
    end

    get 'web_api/v1/ideas/:id' do
      let(:idea) { create(:idea) }
      let!(:baskets) { create_list(:basket, 2, ideas: [idea]) }
      let!(:topic) { create(:topic, ideas: [idea], projects: [idea.project]) }
      let!(:user_vote) { create(:vote, user: @user, votable: idea) }
      let(:id) { idea.id }

      example_request 'Get one idea by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :id)).to eq idea.id
        expect(json_response.dig(:data, :type)).to eq 'idea'
        expect(json_response.dig(:data, :attributes)).to include(
          slug: idea.slug,
          budget: idea.budget,
          action_descriptor: {
            commenting_idea: {
              enabled: true,
              disabled_reason: nil,
              future_enabled: nil
            },
            voting_idea: {
              enabled: true,
              disabled_reason: nil,
              cancelling_enabled: true,
              up: {
                enabled: true,
                disabled_reason: nil,
                future_enabled: nil
              },
              down: {
                enabled: true,
                disabled_reason: nil,
                future_enabled: nil
              }
            },
            comment_voting_idea: {
              enabled: true,
              disabled_reason: nil,
              future_enabled: nil
            },
            budgeting: {
              enabled: false,
              disabled_reason: 'not_budgeting',
              future_enabled: nil
            }
          }
        )
        expect(json_response.dig(:data, :relationships)).to include(
          topics: {
            data: [{ id: topic.id, type: 'topic' }]
          },
          author: { data: { id: idea.author_id, type: 'user' } },
          idea_status: { data: { id: idea.idea_status_id, type: 'idea_status' } },
          user_vote: { data: { id: user_vote.id, type: 'vote' } }
        )
      end
    end

    get 'web_api/v1/ideas/by_slug/:slug' do
      let(:idea) { create(:idea) }
      let(:slug) { idea.slug }

      example_request 'Get one idea by slug' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq idea.id
      end

      describe do
        let(:slug) { 'unexisting-idea' }

        example '[error] Get an unexisting idea', document: false do
          do_request
          expect(status).to eq 404
        end
      end
    end

    get 'web_api/v1/ideas/:idea_id/schema' do
      let(:project) { create(:project_with_active_ideation_phase) }
      let(:custom_form) { create(:custom_form, participation_context: project) }
      let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }
      let(:idea) { create :idea, project: project }
      let(:idea_id) { idea.id }

      example_request 'Get the react-jsonschema-form json schema and ui schema for an ideation input' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:json_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
        expect(json_response[:ui_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
        built_in_field_keys = %i[
          title_multiloc
          body_multiloc
          author_id
          budget
          topic_ids
          location_description
          idea_images_attributes
          idea_files_attributes
        ]

        %i[en fr-FR nl-NL].each do |locale|
          expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq(built_in_field_keys + [custom_field.key.to_sym])
        end
      end

      get 'web_api/v1/ideas/:idea_id/json_forms_schema' do
        let(:project) { create(:project_with_active_ideation_phase) }
        let(:custom_form) { create(:custom_form, participation_context: project) }
        let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }
        let(:idea) { create :idea, project: project }
        let(:idea_id) { idea.id }

        example_request 'Get the jsonforms.io json schema and ui schema for an ideation input' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:json_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
          expect(json_response[:ui_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
          visible_built_in_field_keys = %i[
            title_multiloc
            body_multiloc
            topic_ids
            location_description
            idea_images_attributes
            idea_files_attributes
          ]

          %i[en fr-FR nl-NL].each do |locale|
            expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq(visible_built_in_field_keys + [custom_field.key.to_sym])
          end
        end
      end
    end

    post 'web_api/v1/ideas' do
      with_options scope: :idea do
        parameter :project_id, 'The identifier of the project that hosts the idea', required: true
        parameter :phase_ids, 'The phases the idea is part of, defaults to the current only, only allowed by admins'
        parameter :author_id, 'The user id of the user owning the idea', extra: 'Required if not draft'
        parameter :idea_status_id, 'The status of the idea, only allowed for admins', extra: "Defaults to status with code 'proposed'"
        parameter :publication_status, 'Publication status', required: true, extra: "One of #{Post::PUBLICATION_STATUSES.join(',')}"
        parameter :title_multiloc, 'Multi-locale field with the idea title', required: true, extra: 'Maximum 100 characters'
        parameter :body_multiloc, 'Multi-locale field with the idea body', extra: 'Required if not draft'
        parameter :topic_ids, 'Array of ids of the associated topics'
        parameter :location_point_geojson, 'A GeoJSON point that situates the location the idea applies to'
        parameter :location_description, 'A human readable description of the location the idea applies to'
        parameter :proposed_budget, 'The budget needed to realize the idea, as proposed by the author'
        parameter :budget, 'The budget needed to realize the idea, as determined by the city'
        parameter :idea_images_attributes, 'an array of base64 images to create'
        parameter :idea_files_attributes, 'an array of base64 files to create'
      end
      ValidationErrorHelper.new.error_fields(self, Idea)
      response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::POSTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      describe do
        before { IdeaStatus.create_defaults }

        let(:idea) { build(:idea) }
        let(:project) { create(:continuous_project) }
        let(:project_id) { project.id }
        let(:publication_status) { 'published' }
        let(:title_multiloc) { idea.title_multiloc }
        let(:body_multiloc) { idea.body_multiloc }
        let(:topic_ids) { create_list(:topic, 2, projects: [project]).map(&:id) }
        let(:location_point_geojson) { { type: 'Point', coordinates: [51.11520776293035, 3.921154106874878] } }
        let(:location_description) { 'Stanley Road 4' }

        describe do
          example_request 'Create an idea' do
            assert_status 201
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
            expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
            expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
            expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
            expect(project.reload.ideas_count).to eq 1
          end

          example 'Check for the automatic creation of an upvote by the author when an idea is created', document: false do
            do_request
            json_response = json_parse(response_body)
            new_idea = Idea.find(json_response.dig(:data, :id))
            expect(new_idea.votes.size).to eq 1
            expect(new_idea.votes[0].mode).to eq 'up'
            expect(new_idea.votes[0].user.id).to eq @user.id
            expect(json_response[:data][:attributes][:upvotes_count]).to eq 1
          end

          describe 'Values for disabled fields are ignored' do
            let(:proposed_budget) { 12_345 }

            example_request 'Create an idea with values for disabled fields', document: false do
              expect(status).to be 201
              json_response = json_parse(response_body)
              expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Plant more trees'
              # proposed_budget is disabled, so its given value was ignored.
              expect(json_response.dig(:data, :attributes, :proposed_budget)).to be_nil
              expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
              expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
              expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
            end
          end
        end

        describe 'when posting an idea in an active ideation phase, the creation_phase is not set' do
          let(:project) { create(:project_with_active_ideation_phase) }
          let!(:custom_form) { create(:custom_form, participation_context: project) }

          example_request 'Post an idea in an ideation phase' do
            assert_status 201
            json_response = json_parse response_body
            idea = Idea.find(json_response.dig(:data, :id))
            expect(idea.creation_phase).to be_nil
          end
        end

        describe 'For projects without ideas_order' do
          let(:project) { create(:continuous_project) }

          before do
            project.update_attribute(:ideas_order, nil)
          end

          example_request 'Creates an idea', document: false do
            assert_status 201
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
            expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
            expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
            expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
            expect(project.reload.ideas_count).to eq 1
          end
        end

        describe do
          let(:publication_status) { 'fake_status' }

          example_request '[error] Creating an invalid idea' do
            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:publication_status, 'inclusion', value: 'fake_status')
          end
        end

        describe do
          let(:idea_images_attributes) { [{ image: Base64.encode64(Rails.root.join("spec/fixtures/image#{rand(20)}.png").open.read) }] }

          example_request 'Create an idea with an image' do
            assert_status 201
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :relationships, :idea_images)).to be_present
          end
        end

        describe do
          let(:idea_files_attributes) { [{ name: 'afvalkalender.pdf', file: encode_file_as_base64('afvalkalender.pdf') }] }

          example_request 'Create an idea with a file' do
            assert_status 201
            json_response = json_parse(response_body)
            expect(Idea.find(json_response.dig(:data, :id)).idea_files.size).to eq 1
          end
        end

        describe do
          let(:project) do
            create(:project_with_current_phase, current_phase_attrs: {
              participation_method: 'information'
            })
          end

          example_request '[error] Creating an idea in a project with an active information phase' do
            assert_status 401
            json_response = json_parse(response_body)
            expect(json_response.dig(:errors, :base).first[:error]).to eq 'not_ideation'
          end
        end

        describe do
          let(:project_id) { nil }

          example_request '[error] Create an idea without a project' do
            expect(response_status).to be >= 400
          end
        end

        example '[error] Create an idea when there is a posting disabled reason' do
          expect_any_instance_of(ParticipationContextService)
            .to receive(:posting_idea_disabled_reason_for_context).with(project, @user).and_return('i_dont_like_you')

          do_request

          assert_status 401
          expect(json_parse(response_body)).to include_response_error(:base, 'i_dont_like_you')
        end

        describe do
          before { SettingsService.new.activate_feature! 'blocking_profanity' }

          let(:title_multiloc) { { 'nl-BE' => 'Fuck' } }
          let(:body_multiloc) { { 'fr-FR' => 'cocksucker' } }

          example_request '[error] Create an idea with blocked words' do
            assert_status 422
            json_response = json_parse(response_body)
            blocked_error = json_response.dig(:errors, :base)&.select { |err| err[:error] == 'includes_banned_words' }&.first
            expect(blocked_error).to be_present
            expect(blocked_error[:blocked_words].pluck(:attribute).uniq).to include('title_multiloc', 'body_multiloc')
          end
        end

        context 'when admin' do
          before do
            @user = create(:admin)
            token = Knock::AuthToken.new(payload: @user.to_token_payload).token
            header 'Authorization', "Bearer #{token}"
          end

          describe do
            let(:project) { create(:project_with_current_phase, phases_config: { sequence: 'xxcx' }) }
            let(:phase_ids) { project.phases.sample(1).map(&:id) }

            example_request 'Creating an idea in specific phases' do
              assert_status 201
              json_response = json_parse(response_body)
              expect(json_response.dig(:data, :relationships, :phases, :data).pluck(:id)).to match_array phase_ids
            end
          end

          describe 'when posting an idea in an ideation phase, the creation_phase is not set' do
            let(:project) { create(:project_with_active_ideation_phase) }
            let!(:custom_form) { create(:custom_form, participation_context: project) }
            let(:phase_ids) { [project.phases.first.id] }

            example_request 'Post an idea in an ideation phase', document: false do
              assert_status 201
              json_response = json_parse response_body
              idea = Idea.find(json_response.dig(:data, :id))
              expect(idea.creation_phase).to be_nil
            end
          end

          describe do
            let(:project) { create(:project_with_active_ideation_phase) }
            let(:other_project) { create(:project_with_active_ideation_phase) }
            let(:phase_ids) { [other_project.phases.first.id] }

            example_request '[error] Creating an idea linked to a phase from a different project' do
              assert_status 422
              json_response = json_parse response_body
              expect(json_response).to include_response_error(:ideas_phases, 'invalid')
            end
          end
        end
      end
    end

    patch 'web_api/v1/ideas/:id' do
      with_options scope: :idea do
        parameter :project_id, 'The idea of the project that hosts the idea'
        parameter :phase_ids, 'The phases the idea is part of, defaults to the current only, only allowed by admins'
        parameter :author_id, 'The user id of the user owning the idea', extra: 'Required if not draft'
        parameter :idea_status_id, 'The status of the idea, only allowed for admins'
        parameter :publication_status, "Either #{Post::PUBLICATION_STATUSES.join(', ')}"
        parameter :title_multiloc, 'Multi-locale field with the idea title', extra: 'Maximum 100 characters'
        parameter :body_multiloc, 'Multi-locale field with the idea body', extra: 'Required if not draft'
        parameter :topic_ids, 'Array of ids of the associated topics'
        parameter :location_point_geojson, 'A GeoJSON point that situates the location the idea applies to'
        parameter :location_description, 'A human readable description of the location the idea applies to'
        parameter :proposed_budget, 'The budget needed to realize the idea, as proposed by the author'
        parameter :budget, 'The budget needed to realize the idea, as determined by the city'
      end
      ValidationErrorHelper.new.error_fields(self, Idea)
      response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::POSTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      describe do
        before do
          @project = create(:continuous_project)
          @idea =  create(:idea, author: @user, project: @project)
        end

        let(:id) { @idea.id }
        let(:location_point_geojson) { { type: 'Point', coordinates: [51.4365635, 3.825930459] } }
        let(:location_description) { 'Watkins Road 8' }
        let(:title_multiloc) { { 'en' => 'Changed title' } }
        let(:topic_ids) { create_list(:topic, 2, projects: [@project]).map(&:id) }

        describe do
          example_request 'Update an idea' do
            expect(status).to be 200
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
            expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
            expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
            expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
          end

          example 'Check for the automatic creation of an upvote by the author when the publication status of an idea is updated from draft to published', document: false do
            @idea.update! publication_status: 'draft'
            do_request idea: { publication_status: 'published' }
            json_response = json_parse response_body
            new_idea = Idea.find json_response.dig(:data, :id)
            expect(new_idea.votes.size).to eq 1
            expect(new_idea.votes[0].mode).to eq 'up'
            expect(new_idea.votes[0].user.id).to eq @user.id
            expect(json_response.dig(:data, :attributes, :upvotes_count)).to eq 1
          end

          example '[error] Update an idea when there is a posting disabled reason' do
            expect_any_instance_of(ParticipationContextService)
              .to receive(:posting_idea_disabled_reason_for_context).with(@project, @user).and_return('i_dont_like_you')

            do_request

            assert_status 401
            expect(json_parse(response_body)).to include_response_error(:base, 'i_dont_like_you')
          end
        end

        describe 'Values for disabled fields are ignored' do
          let(:proposed_budget) { 12_345 }

          example_request 'Update an idea with values for disabled fields', document: false do
            expect(status).to be 200
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
            # proposed_budget is disabled, so its given value was ignored.
            expect(json_response.dig(:data, :attributes, :proposed_budget)).to eq @idea.proposed_budget
            expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
            expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
            expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
          end
        end

        describe do
          let(:topic_ids) { [] }

          example 'Remove the topics', document: false do
            @idea.topics = create_list :topic, 2
            do_request
            expect(status).to be 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
          end
        end

        describe do
          let(:idea_status_id) { create(:idea_status).id }

          example 'Change the idea status as a non-admin does not work', document: false do
            do_request
            expect(status).to be 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :idea_status, :data, :id)).to eq @idea.idea_status_id
          end
        end

        describe do
          let(:budget) { 1800 }

          example 'Change the participatory budget as a non-admin does not work', document: false do
            previous_value = @idea.budget
            do_request
            expect(status).to be 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :attributes, :budget)).to eq previous_value
          end
        end

        context 'when admin' do
          before do
            @user = create(:admin)
            token = Knock::AuthToken.new(payload: @user.to_token_payload).token
            header 'Authorization', "Bearer #{token}"
          end

          describe do
            let(:idea_status_id) { create(:idea_status).id }

            example_request 'Change the idea status (as an admin)' do
              expect(status).to be 200
              json_response = json_parse response_body
              expect(json_response.dig(:data, :relationships, :idea_status, :data, :id)).to eq idea_status_id
            end
          end

          describe 'phase_ids' do
            let(:phase) { @project.phases.first }

            context 'when passing some phase ids' do
              before do
                @project = create(:project_with_phases)
                @idea.project = @project
                @idea.save!
                do_request(idea: { phase_ids: phase_ids })
              end

              let(:phase_ids) { [phase].map(&:id) }

              example 'returns a 200 status' do
                expect(status).to be 200
              end

              example 'Change the idea phases (as an admin or moderator)' do
                json_response = json_parse response_body
                expect(json_response.dig(:data, :relationships, :phases, :data).pluck(:id)).to match_array phase_ids
              end

              example 'Changes the ideas count of a phase' do
                expect(phase.reload.ideas_count).to eq 1
              end
            end

            context 'when passing an empty array of phase ids' do
              before do
                @project = create :project_with_phases
                @idea.update! project: @project, phases: [phase]
                do_request(idea: { phase_ids: phase_ids })
              end

              let(:phase_ids) { [] }

              example 'returns a 200 status' do
                expect(status).to be 200
              end

              example 'Change the idea phases (as an admin or moderator)' do
                json_response = json_parse response_body
                expect(json_response.dig(:data, :relationships, :phases, :data).pluck(:id)).to match_array phase_ids
              end

              example 'Changes the ideas count of a phase when the phases change' do
                expect(phase.reload.ideas_count).to eq 0
              end
            end
          end

          describe do
            let(:budget) { 1800 }

            example_request 'Change the participatory budget (as an admin)' do
              expect(status).to be 200
              json_response = json_parse response_body
              expect(json_response.dig(:data, :attributes, :budget)).to eq budget
            end
          end

          describe 'Change the project' do
            before do
              @project.update! allowed_input_topics: create_list(:topic, 2)
              @project2 = create :project, allowed_input_topics: [@project.allowed_input_topics.first]
              @idea.update! topics: @project.allowed_input_topics
            end

            let(:project_id) { @project2.id }

            example_request 'As an admin' do
              expect(status).to be 200
              json_response = json_parse response_body
              expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id

              expect(@idea.reload).to be_valid
            end
          end

          example '[error] Removing the author of a published idea', document: false do
            @idea.update! publication_status: 'published'
            do_request idea: { author_id: nil }
            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:author, 'blank')
          end

          example '[error] Publishing an idea without author', document: false do
            @idea.update! publication_status: 'draft', author: nil
            do_request idea: { publication_status: 'published' }
            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:author, 'blank')
          end
        end

        context 'when moderator' do
          before do
            @moderator = create :project_moderator, projects: [@project]
            token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
            header 'Authorization', "Bearer #{token}"
          end

          describe do
            let(:idea_status_id) { create(:idea_status).id }

            example_request 'Change the idea status (as a moderator)' do
              expect(status).to be 200
              json_response = json_parse response_body
              expect(json_response.dig(:data, :relationships, :idea_status, :data, :id)).to eq idea_status_id
            end
          end
        end

        context 'when unauthorized' do
          before do
            @user = create :user
            token = Knock::AuthToken.new(payload: @user.to_token_payload).token
            header 'Authorization', "Bearer #{token}"
          end

          describe do
            let(:idea_status_id) { create(:idea_status).id }

            example_request 'Change the idea status (unauthorized)' do
              expect(status).to eq 401
            end
          end
        end
      end
    end

    patch 'web_api/v1/ideas/:id' do
      parameter :publication_status, "Either #{Post::PUBLICATION_STATUSES.join(', ')}", required: true, scope: :idea

      describe do
        before do
          @project = create :continuous_project
          @idea = create :idea, author: @user, publication_status: 'draft', project: @project
        end

        let(:id) { @idea.id }
        let(:publication_status) { 'published' }

        example_request 'Change the publication status' do
          expect(response_status).to eq 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :attributes, :publication_status)).to eq 'published'
        end
      end
    end

    delete 'web_api/v1/ideas/:id' do
      context 'when the idea belongs to a continuous project' do
        before do
          @project = create(:continuous_project)
          @idea = create(:idea_with_topics, author: @user, publication_status: 'published', project: @project)
        end

        let(:id) { @idea.id }

        example_request 'Delete an idea' do
          expect(response_status).to eq 200
          expect { Idea.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
          expect(@idea.project.reload.ideas_count).to eq 0
        end
      end

      context 'when the idea belongs to a timeline project' do
        let!(:idea) { create(:idea, author: user, project: project, publication_status: 'published') }
        let(:project) { create(:project_with_phases) }
        let(:phase) { project.phases.first }
        let(:id) { idea.id }

        before do
          allow_any_instance_of(IdeaPolicy).to receive(:destroy?).and_return(true)
          idea.ideas_phases.create!(phase: phase)
        end

        example 'the count starts at 1' do
          expect(phase.reload.ideas_count).to eq 1
        end

        example_request 'Delete an idea' do
          expect(response_status).to eq 200
          expect { Idea.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
          expect(phase.reload.ideas_count).to eq 0
        end
      end
    end
  end

  private

  def encode_file_as_base64(filename)
    "data:application/pdf;base64,#{Base64.encode64(File.read(Rails.root.join('spec', 'fixtures', filename)))}"
  end
end
