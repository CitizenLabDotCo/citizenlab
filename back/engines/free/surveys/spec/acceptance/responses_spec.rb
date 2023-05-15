# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Survey Responses' do
  explanation 'One survey response contains all the answers of a single user on a survey'

  let(:form_body) do
    {
      'id' => 'USLYB6',
      'title' => 'webhooks dev',
      'theme' => { 'href' => 'https://api.typeform.com/themes/6lPNE6' },
      'workspace' => { 'href' => 'https://api.typeform.com/workspaces/9jt4CG' },
      'settings' =>
      { 'is_public' => true,
        'is_trial' => false,
        'language' => 'en',
        'progress_bar' => 'proportion',
        'show_progress_bar' => false,
        'show_typeform_branding' => true,
        'meta' => { 'allow_indexing' => false } },
      'welcome_screens' =>
      [{ 'ref' => 'cd813ca7-1647-4ec1-9910-376e095423c4',
         'title' => 'Welcome!',
         'properties' => { 'show_button' => true, 'button_text' => 'Start' } }],
      'thankyou_screens' =>
      [{ 'ref' => 'default_tys',
         'title' => 'Done! Your information was sent perfectly.',
         'properties' => { 'show_button' => false, 'share_icons' => false } }],
      'fields' =>
      [{ 'id' => 'IspfFyBxDu9D',
         'title' => 'What is your name?',
         'ref' => '60f27960-ee4f-4720-b93b-a9ff3c2488cd',
         'validations' => { 'required' => false },
         'type' => 'short_text' },
        { 'id' => 'xlqRjVwtd5En',
          'title' => 'How tall are you?',
          'ref' => '7eb52f7c-153d-46d4-8dcc-d555599e43ff',
          'properties' =>
          { 'randomize' => false,
            'allow_multiple_selection' => false,
            'allow_other_choice' => false,
            'vertical_alignment' => true,
            'choices' =>
            [{ 'id' => 'HncIN75Kbyjx',
               'ref' => 'a0d6675b-db4d-4ae2-9613-181a32739537',
               'label' => 'mini' },
              { 'id' => 'Ju2T7idNmas0',
                'ref' => 'e32f3ec8-f3cd-4f3c-9b0a-9a5493ad928d',
                'label' => 'short' },
              { 'id' => 'a04OR7HAe67Y',
                'ref' => 'd9973f3a-bc29-4138-b30f-04de21b3d3e3',
                'label' => 'medium' },
              { 'id' => 'ZMZs51iA4JMh',
                'ref' => '47b4485a-760f-4297-9ef4-d8a3056ca006',
                'label' => 'tall' },
              { 'id' => 'W8dCYa08HFAK',
                'ref' => 'fcd68aaf-a7f6-46c5-a408-3b1626795353',
                'label' => 'giant' }] },
          'validations' => { 'required' => false },
          'type' => 'multiple_choice' }],
      '_links' => { 'display' => 'https://citizenlabco.typeform.com/to/USLYB6' }
    }
  end

  let(:responses_body) do
    {
      'items' => [{
        'answers' => [{
          'field' => {
            'id' => 'IspfFyBxDu9D', 'ref' => '60f27960-ee4f-4720-b93b-a9ff3c2488cd', 'type' => 'short_text'
          },
          'text' => 'Kokiko',
          'type' => 'text'
        }, {
          'choice' => {
            'label' => 'medium'
          },
          'field' => {
            'id' => 'xlqRjVwtd5En', 'ref' => '7eb52f7c-153d-46d4-8dcc-d555599e43ff', 'type' => 'multiple_choice'
          },
          'type' => 'choice'
        }],
        'landed_at' => '2019-01-25T14:13:33Z',
        'landing_id' => '7f8835f008ac92737c675f2ff94af43b',
        'metadata' => {
          'browser' => 'default', 'network_id' => '8e2166555d', 'platform' => 'other', 'referer' => 'https://citizenlabco.typeform.com/to/USLYB6', 'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36'
        },
        'response_id' => '7f8835f008ac92737c675f2ff94af43b',
        'submitted_at' => '2019-01-25T14:13:43Z',
        'token' => '7f8835f008ac92737c675f2ff94af43b'
      }, {
        'answers' => [{
          'field' => {
            'id' => 'IspfFyBxDu9D', 'ref' => '60f27960-ee4f-4720-b93b-a9ff3c2488cd', 'type' => 'short_text'
          },
          'text' => 'Koen5',
          'type' => 'text'
        }, {
          'choice' => {
            'label' => 'giant'
          },
          'field' => {
            'id' => 'xlqRjVwtd5En', 'ref' => '7eb52f7c-153d-46d4-8dcc-d555599e43ff', 'type' => 'multiple_choice'
          },
          'type' => 'choice'
        }],
        'landed_at' => '2019-01-25T11:14:16Z',
        'landing_id' => '475451e1cf8c3f13aad47330e8abc9b2',
        'metadata' => {
          'browser' => 'default', 'network_id' => '8e2166555d', 'platform' => 'other', 'referer' => 'https://citizenlabco.typeform.com/to/USLYB6', 'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36'
        },
        'response_id' => '475451e1cf8c3f13aad47330e8abc9b2',
        'submitted_at' => '2019-01-25T11:14:28Z',
        'token' => '475451e1cf8c3f13aad47330e8abc9b2'
      }],
      'page_count' => 1,
      'total_items' => 2
    }
  end

  before do
    admin_header_token
    header 'Content-Type', 'application/json'

    stub_request(:get, 'https://api.typeform.com/forms/HKGaPV')
      .with(headers: { 'Authorization' => 'Bearer' })
      .to_return(status: 200, headers: { 'Content-Type' => 'application/json' }, body: form_body.to_json)

    stub_request(:get, 'https://api.typeform.com/forms/HKGaPV/responses')
      .with(headers: { 'Authorization' => 'Bearer' }, query: { completed: true, page_size: 1000 })
      .to_return(status: 200, headers: { 'Content-Type' => 'application/json' }, body: responses_body.to_json)
  end

  get 'web_api/v1/projects/:participation_context_id/survey_responses/as_xlsx' do
    let(:pc) { create(:continuous_survey_project) }
    let(:participation_context_id) { pc.id }
    # let!(:responses) { create_list(:survey_response, 3, participation_context: pc)}

    example_request 'XLSX export survey responses from continuous project' do
      expect(status).to eq 200
      worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
      expect(worksheet.count).to eq 3
    end

    describe 'when resident' do
      before { resident_header_token }

      example '[error] XLSX export', document: false do
        do_request
        expect(status).to eq 401
      end
    end
  end

  get 'web_api/v1/phases/:participation_context_id/survey_responses/as_xlsx' do
    let(:pc) { create(:phase, participation_method: 'survey', survey_service: 'typeform', survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV') }
    let(:participation_context_id) { pc.id }
    # let!(:responses) { create_list(:survey_response, 2, participation_context: pc)}

    example_request 'XLSX export survey responses from phase' do
      expect(status).to eq 200
      worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
      expect(worksheet.count).to eq 3
    end
  end
end
