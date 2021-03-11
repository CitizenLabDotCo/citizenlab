require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users' do
  explanation 'Citizens and city administrators.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when authenticated' do
    before do
      @user = create(:user, last_name: 'Hoorens')
      @users = %w[Bednar Cole Hagenes MacGyver Oberbrunner].map { |l| create(:user, last_name: l) }
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    context 'when admin' do
      before do
        @user.update(roles: [{ type: 'admin' }])
      end

      get 'web_api/v1/users' do
        with_options scope: :page do
          parameter :number, 'Page number'
          parameter :size, 'Number of users per page'
        end
        parameter :search, 'Filter by searching in first_name, last_name and email', required: false
        parameter :sort,
                  "Sort user by 'created_at', '-created_at', 'last_name', '-last_name', 'email', '-email', 'role', '-role'", required: false
        parameter :group, 'Filter by group_id', required: false
        parameter :can_moderate_project, 'Filter by users (and admins) who can moderate the project (by id)',
                  required: false
        parameter :can_moderate, 'Filter out admins and moderators', required: false

        describe 'List all users in group' do
          example 'with correct pagination', document: false do
            page_size = 5
            project = create(:project)
            group = create(:smart_group, rules: [
                             { ruleType: 'participated_in_project', predicate: 'in', value: project.id }
                           ])
            (page_size + 1).times.map do |_i|
              create(:idea, project: project, author: create(:user))
            end

            do_request(group: group.id, page: { number: 1, size: page_size })
            json_response = json_parse(response_body)

            expect(json_response[:links][:next]).to be_present
          end
        end
      end
    end
  end

  private

  def base64_encoded_image
    "data:image/jpeg;base64,#{encode_image_as_base64('lorem-ipsum.jpg')}"
  end

  def encode_image_as_base64(filename)
    Base64.encode64(File.read(Rails.root.join('spec', 'fixtures', filename)))
  end
end
