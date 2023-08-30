# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::IdeaPlaintextParserService do
  let(:project) { create(:continuous_project) }
  let(:service) { described_class.new create(:admin), project.id, 'en', nil }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

  before do
    # Topics for project
    project.allowed_input_topics << create(:topic_economy)
    project.allowed_input_topics << create(:topic_waste)

    # Custom fields
    create(:custom_field, resource: custom_form, 
      key: 'pool_question', 
      title_multiloc: { 'en' => 'Your favourite name for a swimming pool' }, 
      input_type: 'text', 
      enabled: true,
      required: false
    )

    pizza_select_field = create(:custom_field, resource: custom_form,
      key: 'pizza',
      title_multiloc: { 'en' => 'How much do you like pizza' },
      input_type: 'select',
      enabled: true,
      required: false
    )
    create(:custom_field_option, custom_field: pizza_select_field,
      key: 'a-lot',
      title_multiloc: { 'en' => 'A lot' }
    )
    create(:custom_field_option, custom_field: pizza_select_field,
      key: 'not-at-all',
      title_multiloc: { 'en' => 'Not at all' }
    )

    burger_select_field = create(:custom_field, resource: custom_form,
      key: 'burgers',
      title_multiloc: { 'en' => 'How much do you like burgers' },
      input_type: 'select',
      enabled: true,
      required: false
    )
    create(:custom_field_option, custom_field: burger_select_field,
      key: 'a-lot',
      title_multiloc: { 'en' => 'A lot' }
    )
    create(:custom_field_option, custom_field: burger_select_field,
      key: 'not-at-all',
      title_multiloc: { 'en' => 'Not at all' }
    )
  end

  it 'parses text correctly (single document)' do
    service = described_class.new project.id, 'en'

    text = "Title\n" +
      "My very good idea\n" +
      "Description\n" +
      "would suggest building the\n" +
      "new swimming Pool near the\n" +
      "Shopping mall on Park Lane,\n" +
      "It's easily accessible location\n" + 
      "with enough space\n" + 
      "an\n" +
      "Location (optional)\n" + 
      "Dear shopping mall\n" + 
      "Your favourite name for a swimming pool (optional)\n" +
      "*This answer will only be shared with moderators, and not to the public.\n" +
      "The cool pool\n" +
      "How much do you like pizza (optional)\n" +
      "*This answer will only be shared with moderators, and not to the public.\n" +
      "A lot\n" + 
      "○ Not at all\n" + 
      "How much do you like burgers (optional)\n" + 
      "*This answer will only be shared with moderators, and not to the public.\n" +
      "O A lot\n" + 
      "Not at all\n"

    docs = service.parse_text text

    puts docs

    expect(docs).not_to be_nil
  end

  # it 'parses text correctly (multiple documents)' do
    # # TODO
  # end
end
