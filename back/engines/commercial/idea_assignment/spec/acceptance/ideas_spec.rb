require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  before { header 'Content-Type', 'application/json' }

  context 'when admin' do
    before do
      @user = create :admin
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    get 'web_api/v1/ideas' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of ideas per page'
      end
      parameter :assignee, 'Filter by assignee (user id)', required: false

      example 'List all ideas for an assignee' do
        assignee = create :admin
        idea = create :idea, assignee: assignee
        create_list :idea, 2, assignee: create(:admin)

        do_request assignee: assignee.id

        expect(status).to eq 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 1
        expect(json_response.dig(:data, 0, :id)).to eq idea.id
      end
    end

    get 'web_api/v1/ideas/as_markers' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of ideas per page'
      end
      parameter :assignee, 'Filter by assignee (user id)', required: false

      example 'List all idea markers by assignee' do
        assignee = create :admin
        ideas = create_list :idea, 2, assignee: assignee
        create_list :idea, 3, assignee: create(:admin)

        do_request assignee: assignee.id

        expect(status).to eq 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].pluck(:id)).to match_array ideas.pluck(:id)
      end
    end

    get 'web_api/v1/ideas/as_xlsx' do
      parameter :assignee, 'Filter by assignee (user id)', required: false

      example 'XLSX export by assignee' do
        assignee = create :admin
        ideas = create_list :idea, 2, assignee: assignee
        create :idea

        do_request assignee: assignee.id

        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq (ideas.size + 1)
      end

      example 'XLSX export includes assignee', pending: true do
        raise 'TODO'
      end
    end

    get 'web_api/v1/ideas/filter_counts' do
      parameter :assignee, 'Filter by assignee (user id)', required: false

      example 'List idea counts per filter option by assignee', pending: true do
        raise 'TODO'
      end
    end

    post 'web_api/v1/ideas' do
      with_options scope: :idea do
        parameter :project_id, 'The identifier of the project that hosts the idea'
        parameter :publication_status, 'Publication status', required: true, extra: "One of #{Post::PUBLICATION_STATUSES.join(",")}"
        parameter :title_multiloc, 'Multi-locale field with the idea title', required: true, extra: 'Maximum 100 characters'
        parameter :body_multiloc, 'Multi-locale field with the idea body', extra: 'Required if not draft'
        parameter :assignee_id, 'The user id of the admin/moderator that takes ownership. Set automatically if not provided. Only allowed for admins/moderators.', required: false
      end
      ValidationErrorHelper.new.error_fields self, Idea
      response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
      response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::POSTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

      before do
        create :idea_status, code: 'proposed'
      end

      let(:idea) { build(:idea) }
      let(:default_assignee) { create(:admin) }
      let(:project) { create(:continuous_project, default_assignee: default_assignee) }
      let(:project_id) { project.id }
      let(:publication_status) { 'published' }
      let(:title_multiloc) { idea.title_multiloc }
      let(:body_multiloc) { idea.body_multiloc }

      example 'Create an idea with assignee' do
        assignee = create :admin
        do_request(idea: { assignee_id: assignee.id })

        expect(response_status).to eq 201
        json_response = json_parse response_body
        expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq assignee.id
      end

      example 'Create an idea automatically assigns assignee', document: false do
        do_request

        expect(response_status).to eq 201
        json_response = json_parse response_body
        expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq default_assignee.id
      end
    end
  end

  patch 'web_api/v1/ideas/:id' do
    with_options scope: :idea do
      parameter :assignee_id, 'The user id of the admin/moderator that takes ownership. Only allowed for admins/moderators.'
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::POSTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    before do
      @project = create :continuous_project
      @idea =  create :idea, project: @project
    end

    let(:id) { @idea.id }

    context 'when idea author' do
      before do
        token = Knock::AuthToken.new(payload: @idea.author.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:assignee_id) { create(:admin).id }

      example 'Changing the assignee as the author does not work', document: false do
        do_request
        expect(status).to be 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :relationships, :assignee)).to be_nil
      end
    end

    context 'when admin' do
      before do
        token = Knock::AuthToken.new(payload: create(:admin).to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      example 'Change the assignee' do
        assignee_id = create(:admin).id

        do_request assignee_id: assignee_id

        expect(status).to be 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq assignee_id
      end

      example 'Changing the project keeps the assignee valid', document: false, if: defined?(ProjectManagement::Engine) do
        @idea.update! assignee: create(:project_moderator, projects: [@project])
        do_request project_id: create(:project).id

        expect(status).to be 200
        expect(@idea.reload).to be_valid
        expect(@idea.assignee_id).to be_blank
      end
    end

    context 'when moderator', if: defined?(ProjectManagement::Engine) do
      before do
        @moderator = create :project_moderator, projects: [@project]
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:assignee_id) { create(:admin).id }

      example 'Change the assignee', document: false do
        do_request

        expect(status).to be 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq assignee_id
      end
    end
  end
end
