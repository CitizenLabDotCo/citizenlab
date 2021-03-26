require "rails_helper"

describe Surveys::TypeformApiParser do

  # To test with real API, substitute your API token:
  # let(:tf_api) { Surveys::Typeform::Api.new('2mB2YtaeoD7PcNMUE2VLLeScS4abSphUMJM125jujxAs') }

  let(:tf_api) { instance_double(Surveys::Typeform::Api) }
  let(:service) { Surveys::TypeformApiParser.new(tf_api) }
  let(:form_id) { 'USLYB6' }

  let(:form_response_return_value) {{
    "id"=>"USLYB6",
    "title"=>"webhooks dev",
    "theme"=>{"href"=>"https://api.typeform.com/themes/6lPNE6"},
    "workspace"=>{"href"=>"https://api.typeform.com/workspaces/9jt4CG"},
    "settings"=>
    {"is_public"=>true,
     "is_trial"=>false,
     "language"=>"en",
     "progress_bar"=>"proportion",
     "show_progress_bar"=>false,
     "show_typeform_branding"=>true,
     "meta"=>{"allow_indexing"=>false}},
    "welcome_screens"=>
    [{"ref"=>"cd813ca7-1647-4ec1-9910-376e095423c4",
      "title"=>"Welcome!",
      "properties"=>{"show_button"=>true, "button_text"=>"Start"}}],
    "thankyou_screens"=>
    [{"ref"=>"default_tys",
      "title"=>"Done! Your information was sent perfectly.",
      "properties"=>{"show_button"=>false, "share_icons"=>false}}],
    "fields"=>
    [{"id"=>"IspfFyBxDu9D",
      "title"=>"What is your name?",
      "ref"=>"60f27960-ee4f-4720-b93b-a9ff3c2488cd",
      "validations"=>{"required"=>false},
      "type"=>"short_text"},
     {"id"=>"xlqRjVwtd5En",
      "title"=>"How tall are you?",
      "ref"=>"7eb52f7c-153d-46d4-8dcc-d555599e43ff",
      "properties"=>
       {"randomize"=>false,
        "allow_multiple_selection"=>false,
        "allow_other_choice"=>false,
        "vertical_alignment"=>true,
        "choices"=>
         [{"id"=>"HncIN75Kbyjx",
           "ref"=>"a0d6675b-db4d-4ae2-9613-181a32739537",
           "label"=>"mini"},
          {"id"=>"Ju2T7idNmas0",
           "ref"=>"e32f3ec8-f3cd-4f3c-9b0a-9a5493ad928d",
           "label"=>"short"},
          {"id"=>"a04OR7HAe67Y",
           "ref"=>"d9973f3a-bc29-4138-b30f-04de21b3d3e3",
           "label"=>"medium"},
          {"id"=>"ZMZs51iA4JMh",
           "ref"=>"47b4485a-760f-4297-9ef4-d8a3056ca006",
           "label"=>"tall"},
          {"id"=>"W8dCYa08HFAK",
           "ref"=>"fcd68aaf-a7f6-46c5-a408-3b1626795353",
           "label"=>"giant"}]},
      "validations"=>{"required"=>false},
      "type"=>"multiple_choice"}],
    "_links"=>{"display"=>"https://citizenlabco.typeform.com/to/USLYB6"}
  }}

  let(:all_responses_return_value) {
    [{"landing_id"=>"7f8835f008ac92737c675f2ff94af43b",
      "token"=>"7f8835f008ac92737c675f2ff94af43b",
      "response_id"=>"7f8835f008ac92737c675f2ff94af43b",
      "landed_at"=>"2019-01-25T14:13:33Z",
      "submitted_at"=>"2019-01-25T14:13:43Z",
      "metadata"=>
       {"user_agent"=>
         "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36",
        "platform"=>"other",
        "referer"=>"https://citizenlabco.typeform.com/to/USLYB6",
        "network_id"=>"8e2166555d",
        "browser"=>"default"},
      "answers"=>
       [{"field"=>
          {"id"=>"IspfFyBxDu9D",
           "type"=>"short_text",
           "ref"=>"60f27960-ee4f-4720-b93b-a9ff3c2488cd"},
         "type"=>"text",
         "text"=>"Kokiko"},
        {"field"=>
          {"id"=>"xlqRjVwtd5En",
           "type"=>"multiple_choice",
           "ref"=>"7eb52f7c-153d-46d4-8dcc-d555599e43ff"},
         "type"=>"choice",
         "choice"=>{"label"=>"medium"}}]},
     {"landing_id"=>"475451e1cf8c3f13aad47330e8abc9b2",
      "token"=>"475451e1cf8c3f13aad47330e8abc9b2",
      "response_id"=>"475451e1cf8c3f13aad47330e8abc9b2",
      "landed_at"=>"2019-01-25T11:14:16Z",
      "submitted_at"=>"2019-01-25T11:14:28Z",
      "metadata"=>
       {"user_agent"=>
         "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36",
        "platform"=>"other",
        "referer"=>"https://citizenlabco.typeform.com/to/USLYB6",
        "network_id"=>"8e2166555d",
        "browser"=>"default"},
      "answers"=>
       [{"field"=>
          {"id"=>"IspfFyBxDu9D",
           "type"=>"short_text",
           "ref"=>"60f27960-ee4f-4720-b93b-a9ff3c2488cd"},
         "type"=>"text",
         "text"=>"Koen5"},
        {"field"=>
          {"id"=>"xlqRjVwtd5En",
           "type"=>"multiple_choice",
           "ref"=>"7eb52f7c-153d-46d4-8dcc-d555599e43ff"},
         "type"=>"choice",
         "choice"=>{"label"=>"giant"}}]},
     {"landing_id"=>"83ee634508be12dc4d48116b21d14d29",
      "token"=>"83ee634508be12dc4d48116b21d14d29",
      "response_id"=>"83ee634508be12dc4d48116b21d14d29",
      "landed_at"=>"2019-01-25T11:12:25Z",
      "submitted_at"=>"2019-01-25T11:12:35Z",
      "metadata"=>
       {"user_agent"=>
         "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36",
        "platform"=>"other",
        "referer"=>"https://citizenlabco.typeform.com/to/USLYB6",
        "network_id"=>"8e2166555d",
        "browser"=>"default"},
      "answers"=>
       [{"field"=>
          {"id"=>"IspfFyBxDu9D",
           "type"=>"short_text",
           "ref"=>"60f27960-ee4f-4720-b93b-a9ff3c2488cd"},
         "type"=>"text",
         "text"=>"Koen4"},
        {"field"=>
          {"id"=>"xlqRjVwtd5En",
           "type"=>"multiple_choice",
           "ref"=>"7eb52f7c-153d-46d4-8dcc-d555599e43ff"},
         "type"=>"choice",
         "choice"=>{"label"=>"medium"}}]},
     {"landing_id"=>"df3ff6b301e044a07ba3dd2f5b2b5750",
      "token"=>"df3ff6b301e044a07ba3dd2f5b2b5750",
      "response_id"=>"df3ff6b301e044a07ba3dd2f5b2b5750",
      "landed_at"=>"2019-01-25T11:05:38Z",
      "submitted_at"=>"2019-01-25T11:05:47Z",
      "metadata"=>
       {"user_agent"=>
         "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36",
        "platform"=>"other",
        "referer"=>"https://citizenlabco.typeform.com/to/USLYB6",
        "network_id"=>"8e2166555d",
        "browser"=>"default"},
      "answers"=>
       [{"field"=>
          {"id"=>"IspfFyBxDu9D",
           "type"=>"short_text",
           "ref"=>"60f27960-ee4f-4720-b93b-a9ff3c2488cd"},
         "type"=>"text",
         "text"=>"Koen3"},
        {"field"=>
          {"id"=>"xlqRjVwtd5En",
           "type"=>"multiple_choice",
           "ref"=>"7eb52f7c-153d-46d4-8dcc-d555599e43ff"},
         "type"=>"choice",
         "choice"=>{"label"=>"tall"}}]},
     {"landing_id"=>"ad8413cf0ff8a23b71ad0551a328d977",
      "token"=>"ad8413cf0ff8a23b71ad0551a328d977",
      "response_id"=>"ad8413cf0ff8a23b71ad0551a328d977",
      "landed_at"=>"2019-01-25T10:46:45Z",
      "submitted_at"=>"2019-01-25T10:53:52Z",
      "metadata"=>
       {"user_agent"=>
         "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36",
        "platform"=>"other",
        "referer"=>"https://citizenlabco.typeform.com/to/USLYB6",
        "network_id"=>"8e2166555d",
        "browser"=>"default"},
      "answers"=>
       [{"field"=>
          {"id"=>"IspfFyBxDu9D",
           "type"=>"short_text",
           "ref"=>"60f27960-ee4f-4720-b93b-a9ff3c2488cd"},
         "type"=>"text",
         "text"=>"Koen2"},
        {"field"=>
          {"id"=>"xlqRjVwtd5En",
           "type"=>"multiple_choice",
           "ref"=>"7eb52f7c-153d-46d4-8dcc-d555599e43ff"},
         "type"=>"choice",
         "choice"=>{"label"=>"medium"}}]},
     {"landing_id"=>"deecc70c630a55053d5794a1f6fdf4a4",
      "token"=>"deecc70c630a55053d5794a1f6fdf4a4",
      "response_id"=>"deecc70c630a55053d5794a1f6fdf4a4",
      "landed_at"=>"2019-01-25T10:44:59Z",
      "submitted_at"=>"2019-01-25T10:45:11Z",
      "metadata"=>
       {"user_agent"=>
         "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36",
        "platform"=>"other",
        "referer"=>"https://citizenlabco.typeform.com/to/USLYB6",
        "network_id"=>"8e2166555d",
        "browser"=>"default"},
      "answers"=>
       [{"field"=>
          {"id"=>"IspfFyBxDu9D",
           "type"=>"short_text",
           "ref"=>"60f27960-ee4f-4720-b93b-a9ff3c2488cd"},
         "type"=>"text",
         "text"=>"Koen"},
        {"field"=>
          {"id"=>"xlqRjVwtd5En",
           "type"=>"multiple_choice",
           "ref"=>"7eb52f7c-153d-46d4-8dcc-d555599e43ff"},
         "type"=>"choice",
         "choice"=>{"label"=>"tall"}}]}]
  }

  describe "get_responses" do
    it "generates valid Surveys::Response's, participation_context excluded" do
      pc = create(:project)

      expect(tf_api)
        .to receive(:form)
        .with(form_id: form_id)
        .and_return(OpenStruct.new(parsed_response: form_response_return_value, code: 200, 'success?' => true))

      expect(tf_api)
        .to receive(:all_responses)
        .with(form_id: form_id, completed: true)
        .and_return(all_responses_return_value)

      responses = service.get_responses(form_id)
      expect(responses).to all(be_a(Surveys::Response))

      responses.each{|r| r.participation_context = pc}
      expect(responses).to all(be_valid)
    end
  end

end