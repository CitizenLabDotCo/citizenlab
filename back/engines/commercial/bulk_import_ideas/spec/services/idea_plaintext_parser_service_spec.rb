# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::IdeaPlaintextParserService do
  describe 'form without descriptions' do
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

    # Based on fixtures/slightly_better.pdf, with added page numbers
    it 'parses text correctly (single document)' do
      text = "Page 1
        Title\n" +
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
        "Page 2\n" +
        "How much do you like burgers (optional)\n" + 
        "*This answer will only be shared with moderators, and not to the public.\n" +
        "O A lot\n" + 
        "Not at all\n"

      service = described_class.new project.id, 'en', nil
      docs = service.parse_text text

      result = [{
        :pages=>[1, 2],
        :fields=>
         {"Description"=>
           "would suggest building the new swimming Pool near the Shopping mall on Park Lane, It's easily accessible location with enough space an",
          "Location (optional)"=>"Dear shopping mall",
          "Your favourite name for a swimming pool (optional)"=>"The cool pool",
          "How much do you like pizza (optional)"=>"A lot",
          "How much do you like burgers (optional)"=>"Not at all"}}]

      expect(docs).to eq result
    end

    # Based on fixtures/multiple.pdf, with added page numbers
    it 'parses text correctly (multiple documents)' do
      text = "Page 1\n
        Title\n
        Another great idea, wow\n
        Description\n
        Can you\n
        believe how great this\n
        idea is? Absolutely mind-blowing.\n
        next-level stuff\n
        Location (optional)\n
        Pachecolaan 34, Brussels\n
        Your favourite name for a swimming pool (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        How much do you like pizza (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        ○ A lot\n
        ① Not at all\n
        Page 2\n
        How much do you like burgers (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        ☑ A lot\n
        ○ Not at all\n
        Page 1\n
        Title\n
        This one is a bil mediarre\n
        inedio,\n
        Description\n
        Honestly, I've seen better ideas.\n
        This one is a bit\n
        dissappointing.\n
        Location (optional)\n
        Your favourite name for a swimming pool (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        Pooly Mc Poolface\n
        How much do you like pizza (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        A lot\n
        ○ Not at all\n
        Page 2\n
        How much do you like burgers (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        ⑨ A lot\n
        ○ Not at all\n
      "
        .lines
        .select { |line| line != "\n" }
        .map { |line| line.strip }
        .join("\n")

      service = described_class.new project.id, 'en', nil
      docs = service.parse_text text

      result = [{
        :pages=>[1, 2],
        :fields=>
         {"Title"=>"Another great idea, wow",
          "Description"=>
           "Can you believe how great this idea is? Absolutely mind-blowing. next-level stuff",
          "Location (optional)"=>"Pachecolaan 34, Brussels",
          "Your favourite name for a swimming pool (optional)"=>nil,
          "How much do you like pizza (optional)"=>"Not at all",
          "How much do you like burgers (optional)"=>"A lot"}},
       {
        :pages=>[1, 2],
        :fields=>
         {"Title"=>"This one is a bil mediarre inedio,",
          "Description"=>
           "Honestly, I've seen better ideas. This one is a bit dissappointing.",
          "Location (optional)"=>nil,
          "Your favourite name for a swimming pool (optional)"=>"Pooly Mc Poolface",
          "How much do you like pizza (optional)"=>"A lot",
          "How much do you like burgers (optional)"=>"A lot"}}]
  
      expect(docs).to eq result
    end
  end

  describe 'form with descriptions' do
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
        description_multiloc: { 'en' => "<p>A slightly longer description under a field, with a bunch of words used to explain things to people. Please don't put anything weird in this field, thanks!</p>" },
        input_type: 'text', 
        enabled: true,
        required: false
      )

      pizza_select_field = create(:custom_field, resource: custom_form,
        key: 'pizza',
        title_multiloc: { 'en' => 'How much do you like pizza' },
        description_multiloc: { 'en' => '<p>A short description</p>' },
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

      # TODO
    end

    # Based on fixtures/with_page_numbers.pdf, but with description moved
    it 'parses text correctly (single document)' do
      text = "Page 1\n
        Title\n
        Page numbers test\n
        Description\n
        Page numbers test description\n
        with words and things\n
        Location (optional)\n
        Somewhere\n
        Your favourite name for a swimming pool (optional)\n
        A slightly longer description under a field, with a bunch of words used to explain things to\n
        people. Please don't put anything weird in this field, thanks!\n
        *This answer will only be shared with moderators, and not to the public.\n
        Page 2\n
        How much do you like pizza (optional)\n
        A short description\n
        *This answer will only be shared with moderators, and not to the public.\n
        A lot\n
        ○ Not at all\n
        How much do you like burgers (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        ○ A lot\n
        ☑ Not at all\n
        Which flavors do you want?\n
        *Choose as many as you like\n
        *This answer will only be shared with moderators, and not to the public.\n
        ☐ Vanilla\n
        ☑ Strawberry\n
        Chocolate\n
        Pistachio\n
      "
        .lines
        .select { |line| line != "\n" }
        .map { |line| line.strip }
        .join("\n")

      service = described_class.new project.id, 'en', nil
      docs = service.parse_text text

      binding.pry

      # TODO assert
    end

    it 'parses text correctly (multiple documents)' do
      # TODO
    end
  end
end
