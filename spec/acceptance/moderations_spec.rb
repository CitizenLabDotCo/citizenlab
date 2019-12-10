require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Moderations" do
 
  explanation "Moderations are pieces of user-generated content that need to be moderated"

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    @time = Time.now
    @m1 = create(:idea, 
      title_multiloc: {'en' => 'More bicycle repairmen'}, 
      body_multiloc: {'en' => 'They are the true heroes of society'},
      published_at: @time - 1.day
      )
    @m2 = create(:comment, 
      body_multiloc: {'en' => 'I\'m glad there\'s still heroes around'},
      post: @m1, 
      created_at: @time - 1.hour
      )
    @m3 = create(:idea, 
      title_multiloc: {'en' => 'Fewer bicycle repairmen'}, 
      body_multiloc: {'en' => 'They are pretentious donkeys'},
      published_at: @time - 2.days
      )
    @m4 = create(:initiative, 
      title_multiloc: {'en' => 'Burn more leaves'}, 
      body_multiloc: {'en' => 'We must return that CO2 to our atmosphere at all cost'},
      published_at: @time - 1.minute
      )
  end

  get "web_api/v1/moderations" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of moderations per page"
    end
    example_request "List all moderations" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
    end
  end
end
