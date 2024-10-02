require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Cosponsorships' do
  explanation 'Cosponsorships are the relationships between users and ideas. They can be pending or accepted.'
  header 'Content-Type', 'application/json'

  before do
    header 'Content-Type', 'application/json'
    @project = create(:single_phase_proposals_project)
    @idea = create(:idea, project: @project, phases: @project.phases)
    @user = create(:user)
    @cosponsorship = create(:cosponsorship, user: @user, idea: @idea)
  end

  let(:idea_id) { @idea.id }
  let(:cosponsorship_id) { @cosponsorship.id }

  get 'web_api/v1/ideas/:idea_id/cosponsorships' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of cosponsorships per page'
    end

    before do
      @cosponsorships = create_list(:cosponsorship, 2, idea: @idea)
    end

    example 'List all cosponsorships for an idea' do
      do_request idea_id: @idea.id
      expect(status).to eq 200
      expect(response_data.size).to eq 3
    end
  end

  context 'when the user is the invited user' do
    patch 'web_api/v1/ideas/:idea_id/cosponsorships/:cosponsorship_id/accept' do
      before do
        header 'Authorization', authorization_header(@user)
      end

      example_request 'Accept a cosponsorship when the user is the invited user' do
        expect(status).to eq 200
        expect(response_data.dig(:attributes, :status)).to eq 'accepted'
      end
    end
  end

  context 'when the user is not the invited user' do
    patch 'web_api/v1/ideas/:idea_id/cosponsorships/:cosponsorship_id/accept' do
      example_request 'Accept a cosponsorship when the user is not the invited user' do
        expect(status).to eq 401
      end
    end
  end
end
