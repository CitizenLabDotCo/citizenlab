require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource 'Moderations' do

  get 'web_api/v1/moderations' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of moderations per page'
    end

    context 'when moderator' do
      before do
        @project = create(:project)
        @moderator = create(:project_moderator, project: @project)
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}" 

        @idea = create(:idea, project: @project)
        @comment = create(:comment, post: @idea)
        @flag = create(:inappropriate_content_flag, flaggable: @comment, toxicity_label: 'insult')
      end
      
      example_request 'Moderations include inappropriate content flag' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:included].map{|d| d[:id]}).to include(@flag.id)
        expect(json_response[:included].map{|d| d.dig(:attributes, :toxicity_label)}).to include('insult')
        idea_data = json_response[:data].find{|d| d[:id] == @idea.id}
        expect(idea_data[:relationships].keys).not_to include(:inappropriate_content_flag)
      end
    end
  end

end
