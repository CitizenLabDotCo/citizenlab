require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects' do
  explanation 'Ideas have to be posted in a city project, or they can be posted in the open idea box.'

  before do
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"

    @projects = ['published','published','draft','published','archived','archived','published']
      .map { |ps|  create(:project, admin_publication_attributes: {publication_status: ps})}
  end

  post 'web_api/v1/projects' do
    with_options scope: :project do
      parameter :default_assignee_id,
                'The user id of the admin or moderator that gets assigned to ideas by default. Defaults to unassigned',
                required: false
    end
  end

  patch 'web_api/v1/projects/:id' do
    let(:project) { create(:project, process_type: 'continuous') }
    let(:id) { project.id }

    with_options scope: :project do
      parameter :default_assignee_id,
                'The user id of the admin or moderator that gets assigned to ideas by default. Defaults to unassigned',
                required: false
      # expect(json_response.dig(:data,:relationships,:default_assignee,:data,:id)).to eq default_assignee_id
    end

    example 'Set default assignee to unassigned', document: false do
      project.update!(default_assignee: create(:admin))
      do_request(project: { default_assignee_id: nil })
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :relationships, :default_assignee, :data, :id)).to be_nil
    end
  end
end

def encode_image_as_base64(filename)
  "data:image/png;base64,#{Base64.encode64(File.read(Rails.root.join('spec', 'fixtures', filename)))}"
end
