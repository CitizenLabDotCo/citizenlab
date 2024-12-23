require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/ideas' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of ideas per page'
    end
    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :projects, 'Filter by projects (OR)', required: false
    parameter :phase, 'Filter by project phase', required: false
    parameter :basket_id, 'Filter by basket', required: false
    parameter :author, 'Filter by author (user id)', required: false
    parameter :idea_status, 'Filter by status (idea status id)', required: false
    parameter :search, 'Filter by searching in title and body', required: false
    parameter :sort, "Either 'new', '-new', 'trending', '-trending', 'popular', '-popular', 'author_name', '-author_name', 'likes_count', '-likes_count', 'dislikes_count', '-dislikes_count', 'status', '-status', 'baskets_count', '-baskets_count', 'votes_count', '-votes_count', 'budget', '-budget', 'random'", required: false
    parameter :publication_status, 'Filter by publication status; returns all published ideas by default', required: false
    parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}", required: false
    parameter :feedback_needed, 'Filter out ideas that need feedback', required: false
    parameter :filter_trending, 'Filter out truly trending ideas', required: false

    context 'when moderator' do
      before { header_token_for(moderator) }

      let(:moderator) { create(:project_moderator, projects: [project]) }
      let(:input1) { create(:idea, project: project) }
      let(:input2) { create(:idea, project: project) }
      let!(:inputs) { [input1, input2] }

      context 'in a voting phase' do
        let(:project) { create(:single_phase_single_voting_project) }
        let(:phase) { project.phases.first.id }
        let(:admin) { create(:admin) }

        before do
          input1.set_manual_votes(5, admin)
          input2.set_manual_votes(8, moderator)
          inputs.each do |input|
            input.phases = project.phases
            input.save!
          end
        end

        example_request 'See the manual votes attributes' do
          assert_status 200

          input1_response = json_response_body[:data].find { |i| i[:id] == input1.id }
          expect(input1_response.dig(:attributes, :manual_votes_amount)).to eq 5
          expect(input1_response.dig(:attributes, :total_votes)).to eq 5
          expect(input1_response.dig(:relationships, :manual_votes_last_updated_by, :data, :id)).to eq admin.id
          expect(json_response_body[:included].find { |i| i[:id] == admin.id }&.dig(:attributes, :slug)).to eq admin.slug
          expect(input1_response.dig(:attributes, :manual_votes_last_updated_at)).to be_present

          input2_response = json_response_body[:data].find { |i| i[:id] == input2.id }
          expect(input2_response.dig(:attributes, :manual_votes_amount)).to eq 8
          expect(input2_response.dig(:attributes, :total_votes)).to eq 8
          expect(input2_response.dig(:relationships, :manual_votes_last_updated_by, :data, :id)).to eq moderator.id
          expect(json_response_body[:included].find { |i| i[:id] == moderator.id }&.dig(:attributes, :slug)).to eq moderator.slug
          expect(input2_response.dig(:attributes, :manual_votes_last_updated_at)).to be_present
        end
      end
    end

    context 'when resident' do
      let(:resident) { create(:user) }

      before do
        header_token_for(resident)
        @ideas = %w[published published draft published published].map do |ps|
          create(:idea, publication_status: ps)
        end
        @proposal = create(:proposal)
        survey_project = create(:single_phase_native_survey_project)
        create(:idea, project: survey_project, creation_phase: survey_project.phases.first)
      end

      example_request 'List all published inputs (default behaviour)' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data].map { |d| d.dig(:attributes, :publication_status) }).to all(eq 'published')
        expect(json_response[:data].pluck(:id)).to include(@proposal.id)
      end

      example 'List all transitive inputs' do
        do_request transitive: true

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
        expect(json_response[:data].pluck(:id)).to match_array [@ideas[0].id, @ideas[1].id, @ideas[3].id, @ideas[4].id]
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
        l = create(:single_phase_ideation_project)
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

      example 'List all ideas in a basket' do
        basket = create(:basket)
        [@ideas[1], @ideas[2], @ideas[4]].each { |idea| idea.baskets << basket }

        do_request(basket_id: basket.id)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].pluck(:id)).to match_array [@ideas[1].id, @ideas[4].id]
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
        ideas = [
          create(:idea, title_multiloc: { en: 'This idea is uniqque' }),
          create(:idea, title_multiloc: { en: 'This one origiinal' })
        ]

        do_request search: 'uniqque'
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 1
        expect(json_response[:data][0][:id]).to eq ideas[0].id
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

      example 'List all ideas includes the user_reaction and user_follower', document: false do
        reaction = create(:reaction, user: resident)
        follower = create(:follower, followable: create(:idea), user: resident)

        do_request
        json_response = json_parse(response_body)
        expect(json_response[:data].filter_map { |d| d.dig(:relationships, :user_reaction, :data, :id) }.first).to eq reaction.id
        expect(json_response[:data].filter_map { |d| d.dig(:relationships, :user_follower, :data, :id) }.first).to eq follower.id
        expect(json_response[:included].pluck(:id)).to include reaction.id
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

      example 'List all ideas in a phase of a project - baskets_count and votes_count are overwritten with values from ideas_phase' do
        pr = create(:project_with_active_budgeting_phase)
        phase = pr.phases.first
        ideas = create_list(:idea, 2, phases: [phase], project: pr)
        basket = create(:basket, phase: phase, submitted_at: nil)
        basket2 = create(:basket, phase: phase, submitted_at: nil)
        basket.update!(ideas: ideas, submitted_at: Time.zone.now)
        basket2.update!(ideas: ideas, submitted_at: Time.zone.now)
        SideFxBasketService.new.after_update basket, resident
        SideFxBasketService.new.after_update basket2, resident

        # Different phase (should be ignored in the counts)
        phase2 = create(:single_voting_phase, project: pr)
        basket3 = create(:basket, phase: phase2, submitted_at: nil)
        basket3.update!(ideas: ideas, submitted_at: Time.zone.now)
        SideFxBasketService.new.after_update basket3, resident

        do_request phase: phase.id
        assert_status 200

        expect(response_data.size).to eq 2
        expect(response_data.pluck(:id)).to match_array [ideas[0].id, ideas[1].id]
        ideas_phases = json_response_body[:included].map { |i| i if i[:type] == 'ideas_phase' }.compact!
        expect(ideas_phases.size).to eq 2
        expect(ideas_phases[0][:attributes][:baskets_count]).to eq 2
        expect(ideas_phases[1][:attributes][:baskets_count]).to eq 2

        # Check the value in idea has also been overwritten
        expect(ideas[0].reload[:baskets_count]).to eq 3
        expect(response_data[0][:attributes][:baskets_count]).to eq 2
      end
    end

    example 'Shows manual_votes in a voting phase' do
      project = create(:single_phase_single_voting_project)
      phase = project.phases.first.id
      admin = create(:admin)
      input1 = create(:idea, project: project)
      input2 = create(:idea, project: project)
      inputs = [input1, input2]

      input1.set_manual_votes(5, admin)
      inputs.each do |input|
        input.phases = project.phases
        input.save!
      end

      do_request(phase:)
      assert_status 200

      input1_response = json_response_body[:data].find { |i| i[:id] == input1.id }
      expect(input1_response.dig(:attributes, :manual_votes_amount)).to eq 5
      expect(input1_response.dig(:attributes, :total_votes)).to eq 5
      # These are only for admins/moderators
      expect(input1_response.dig(:attributes, :manual_votes_last_updated_at)).to be_nil
      expect(input1_response.dig(:relationships, :manual_votes_last_updated_by)).to be_nil
    end

    describe 'visibility for submitted inputs' do
      let!(:prescreening) { create(:proposals_status, code: 'prescreening') }
      let!(:proposed) { create(:proposals_status, code: 'proposed') }
      let!(:custom_status) { create(:proposals_status) }
      let(:user) { create(:user) }
      let!(:published_proposal) { create(:proposal, publication_status: 'published', idea_status: custom_status) }
      let!(:author_prescreening_proposal) { create(:proposal, publication_status: 'submitted', idea_status: prescreening, author: user) }
      let!(:other_prescreening_proposal) { create(:proposal, publication_status: 'submitted', idea_status: prescreening, author: create(:user)) }
      let!(:author_published_proposal) { create(:proposal, publication_status: 'published', idea_status: proposed, author: user) }
      let!(:other_published_proposal) { create(:proposal, publication_status: 'published', idea_status: proposed, author: create(:user)) }

      context 'when visitor' do
        example 'Lists all published inputs and the submitted inputs of the author', document: false do
          do_request
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].pluck(:id)).to match_array([
            published_proposal.id,
            author_published_proposal.id,
            other_published_proposal.id
          ])
        end
      end

      context 'when resident' do
        before { header_token_for(user) }

        example 'Lists all published inputs and the submitted inputs of the author', document: false do
          do_request
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 4
          expect(json_response[:data].pluck(:id)).to match_array([
            published_proposal.id,
            author_prescreening_proposal.id,
            author_published_proposal.id,
            other_published_proposal.id
          ])
        end
      end

      context 'when admin' do
        before { header_token_for(user) }

        let(:user) { create(:admin) }

        example 'Lists all published inputs and the submitted inputs of the author', document: false do
          do_request
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].pluck(:id)).to match_array([
            published_proposal.id,
            author_prescreening_proposal.id,
            other_prescreening_proposal.id,
            author_published_proposal.id,
            other_published_proposal.id
          ])
        end
      end
    end
  end
end
