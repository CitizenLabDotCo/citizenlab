# frozen_string_literal: true

require 'rails_helper'

class TestVisitor < FieldVisitorService
  def visit_text(_field)
    'text from visitor'
  end

  def visit_number(_field)
    'number from visitor'
  end

  def visit_multiline_text(_field)
    'multiline_text from visitor'
  end

  def visit_html(_field)
    'html from visitor'
  end

  def visit_text_multiloc(_field)
    'text_multiloc from visitor'
  end

  def visit_multiline_text_multiloc(_field)
    'multiline_text_multiloc from visitor'
  end

  def visit_html_multiloc(_field)
    'html_multiloc from visitor'
  end

  def visit_select(_field)
    'select from visitor'
  end

  def visit_select_image(_field)
    'select_image from visitor'
  end

  def visit_multiselect(_field)
    'multiselect from visitor'
  end

  def visit_multiselect_image(_field)
    'multiselect_image from visitor'
  end

  def visit_checkbox(_field)
    'checkbox from visitor'
  end

  def visit_date(_field)
    'date from visitor'
  end

  def visit_files(_field)
    'files from visitor'
  end

  def visit_image_files(_field)
    'image_files from visitor'
  end

  def visit_point(_field)
    'point from visitor'
  end

  def visit_line(_field)
    'line from visitor'
  end

  def visit_polygon(_field)
    'polygon from visitor'
  end

  def visit_linear_scale(_field)
    'linear_scale from visitor'
  end

  def visit_matrix_linear_scale(_field)
    'matrix_linear_scale from visitor'
  end

  def visit_rating(_field)
    'rating from visitor'
  end

  def visit_page(_field)
    'page from visitor'
  end

  def visit_topic_ids(_field)
    'topic_ids from visitor'
  end

  def visit_cosponsor_ids(_field)
    'cosponsor_ids from visitor'
  end

  def visit_file_upload(_field)
    'file_upload from visitor'
  end

  def visit_shapefile_upload(_field)
    'shapefile_upload from visitor'
  end

  def visit_ranking(_field)
    'ranking from visitor'
  end

  def visit_sentiment_linear_scale(_field)
    'sentiment_linear_scale from visitor'
  end
end

RSpec.describe CustomField do
  let(:field) { described_class.new input_type: 'not_important_for_this_test' }

  describe 'factories' do
    it 'create a valid matrix linear scale field' do
      field = create(:custom_field_matrix_linear_scale)

      expect(field).to be_valid
      expect(field.matrix_statements).to be_present
    end
  end

  describe '#logic?' do
    it 'returns true when there is logic' do
      field.logic = { 'rules' => [{ if: 2, goto_page_id: 'some_page_id' }] }
      expect(field.logic?).to be true

      field.logic = { 'next_page_id' => 'some_page_id' }
      expect(field.logic?).to be true
    end

    it 'returns false when there is no logic' do
      field.logic = nil
      expect(field.logic?).to be false

      field.logic = {}
      expect(field.logic?).to be false

      field.logic = { 'rules' => [] }
      expect(field.logic?).to be false
    end
  end

  describe '#file_upload?' do
    it 'returns true when the input_type is "file_upload"' do
      files_field = described_class.new input_type: 'file_upload'
      expect(files_field.file_upload?).to be true
    end

    it 'returns true when the input_type is "shapefile_upload"' do
      files_field = described_class.new input_type: 'shapefile_upload'
      expect(files_field.file_upload?).to be true
    end

    it 'returns false otherwise' do
      other_field = described_class.new input_type: 'something_else'
      expect(other_field.file_upload?).to be false
    end
  end

  describe '#multiloc?' do
    it 'returns true when the input_type is "text_multiloc"' do
      files_field = described_class.new input_type: 'text_multiloc'
      expect(files_field.multiloc?).to be true
    end

    it 'returns true when the input_type is "multiline_text_multiloc"' do
      files_field = described_class.new input_type: 'multiline_text_multiloc'
      expect(files_field.multiloc?).to be true
    end

    it 'returns true when the input_type is "html_multiloc"' do
      files_field = described_class.new input_type: 'html_multiloc'
      expect(files_field.multiloc?).to be true
    end

    it 'returns false otherwise' do
      other_field = described_class.new input_type: 'something_else'
      expect(other_field.multiloc?).to be false
    end
  end

  describe '#page?' do
    it 'returns true when the input_type is "page"' do
      page_field = described_class.new input_type: 'page'
      expect(page_field.page?).to be true
    end

    it 'returns false otherwise' do
      other_field = described_class.new input_type: 'something_else'
      expect(other_field.page?).to be false
    end
  end

  describe 'page_layout validation' do
    context 'for page custom_field' do
      let(:page_custom_field) { build(:custom_field_page) }

      it 'is valid when the page_layout is a valid value' do
        page_custom_field.page_layout = 'default'
        expect(page_custom_field.valid?).to be true

        page_custom_field.page_layout = 'map'
        expect(page_custom_field.valid?).to be true
      end

      it 'is invalid when the page_layout is an invalid value' do
        page_custom_field.page_layout = 'invalid_value'
        expect(page_custom_field.valid?).to be false
      end

      it 'is invalid when the page_layout is nil' do
        page_custom_field.page_layout = nil
        expect(page_custom_field.valid?).to be false
      end
    end

    context 'for non-page custom_field' do
      let(:custom_field) { build(:custom_field) }

      it 'is valid when the page_layout is nil' do
        custom_field.page_layout = nil
        expect(custom_field.valid?).to be true
      end

      it 'is invalid when the page_layout is not nil' do
        custom_field.page_layout = 'default'
        expect(custom_field.valid?).to be false
      end
    end
  end

  describe 'title_multiloc validation' do
    let(:form) { create(:custom_form) }

    it 'happens when the field is not a page' do
      non_page_field = described_class.new(
        resource: form,
        input_type: 'text',
        key: 'field_key',
        title_multiloc: { 'en' => '' }
      )
      expect(non_page_field.valid?).to be false
      expect(non_page_field.errors.details).to eq({ title_multiloc: [{ error: :blank }] })

      non_page_field.title_multiloc = {}
      expect(non_page_field.valid?).to be false
      expect(non_page_field.errors.details).to eq({ title_multiloc: [{ error: :blank }, { error: :blank }] })

      non_page_field.title_multiloc = nil
      expect(non_page_field.valid?).to be false
      expect(non_page_field.errors.details).to eq({ title_multiloc: [{ error: :blank }, { error: 'is not a translation hash' }] })

      non_page_field.title_multiloc = { 'en' => 'Here is the title' }
      expect(non_page_field.valid?).to be true
    end

    it 'does not happen when the field is a page' do
      page_field = described_class.new(
        resource: form,
        input_type: 'page',
        page_layout: 'default',
        key: 'field_key',
        title_multiloc: { 'en' => '' }
      )
      expect(page_field.valid?).to be true

      page_field.title_multiloc = {}
      expect(page_field.valid?).to be true

      page_field.title_multiloc = nil
      expect(page_field.valid?).to be true
    end
  end

  context 'hooks' do
    it 'generates a key on creation, if not specified' do
      cf = create(:custom_field, key: nil)
      expect(cf.key).to be_present
    end

    describe 'saving a custom field without title_multiloc' do
      it 'produces validation errors on the key and the title_multiloc' do
        form = create(:custom_form)
        field = described_class.new resource: form, input_type: 'text', title_multiloc: {}
        expect(field.save).to be false
        expect(field.errors.details).to eq({
          key: [
            { error: :blank },
            { error: :invalid, value: nil }
          ],
          title_multiloc: [
            { error: :blank },
            { error: :blank }
          ]
        })
      end
    end

    it 'generates unique keys in the resource_type scope, if not specified' do
      cf1 = create(:custom_field)
      cf2 = create(:custom_field)
      cf3 = create(:custom_field)
      expect([cf1, cf2, cf3].map(&:key).uniq).to match [cf1, cf2, cf3].map(&:key)
    end

    it 'generates a key made of non-Latin letters of title' do
      cf = create(:custom_field, key: nil, title_multiloc: { 'ar-SA': 'abbaالرئيسية' })
      expect(cf.key[0..-5]).to eq('abba')
    end

    it 'generates a key appended with a random 3 character value' do
      cf = create(:custom_field, key: nil, title_multiloc: { 'ar-SA': 'abbaالرئيسية' })
      expect(cf.key[-4..]).to match(/[0-9a-z]{3}/)
    end

    it 'generates a present key from non-Latin title' do
      cf = create(:custom_field, key: nil, title_multiloc: { 'ar-SA': 'الرئيسية' })
      expect(cf.key).to be_present
    end
  end

  context 'when domicile field is created' do
    before { create_list(:area, 2) }

    let(:domicile_field) { create(:custom_field_domicile) }

    it 'creates custom field options from areas', :aggregate_failures do
      expect(domicile_field.options.count).to eq(Area.count + 1)
      expect(domicile_field.options.take(Area.count).pluck(:id, :ordering, :title_multiloc))
        .to match_array(Area.pluck(:custom_field_option_id, :ordering, :title_multiloc))

      # 'somewhere else' option should be the last.
      expect(domicile_field.options.last.area).to be_nil
    end

    describe 'ordered_transformed_options' do
      it 'returns the ordered domicile options with keys and titles from areas' do
        options = domicile_field.ordered_transformed_options
        expect(options.pluck(:key)).to eq(Area.order(:ordering).pluck(:id) + ['outside'])
        expect(options.last.title_multiloc['en']).to eq 'Somewhere else'
      end
    end
  end

  describe 'description sanitizer' do
    it 'sanitizes script tags in the description' do
      custom_field = create(:custom_field, description_multiloc: {
        'en' => '<p>Test</p><script>This content will stay</script><p>This content will also stay</p><a href="http://www.citizenlab.co" rel="nofollow">Click</a>'
      })
      expect(custom_field.description_multiloc).to eq({ 'en' => '<p>Test</p>This content will stay<p>This content will also stay</p><a href="http://www.citizenlab.co" rel="nofollow">Click</a>' })
    end

    it 'does not sanitize allowed tags in the description' do
      description_multiloc = { 'en' => <<-DESC
      <h2> This is fine ! </h2>
      <h3> Everything is fine ! </h3>
      <ul>
        <li> <strong> strong </strong> </li>
        <li> <em> emphasis </em> </li>
        <li> <i> alternate </i> </li>
      </ul>
      <ol>
        <li> <u> unarticulated </u> </li>
        <li> <b> bold </b> </li>
        <li> <a href="https://www.example.com" rel="nofollow"> link </a> </li>
      </ol>
      DESC
      }

      custom_field = create(:custom_field, description_multiloc: description_multiloc)
      expect(custom_field.description_multiloc).to eq(description_multiloc)
    end
  end

  describe '#sanitize_title_multiloc' do
    it 'removes all HTML tags from title multiloc' do
      cf = build(
        :custom_field_option,
        title_multiloc: {
          'en' => 'Thing <script>alert("XSS")</script> something',
          'fr-BE' => 'Something <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      cf.save!

      expect(cf.title_multiloc['en']).to eq('Thing alert("XSS") something')
      expect(cf.title_multiloc['fr-BE']).to eq('Something ')
      expect(cf.title_multiloc['nl-BE']).to eq('Plain text with formatting')
    end
  end

  describe '#accept' do
    let(:visitor) { TestVisitor.new }

    described_class::INPUT_TYPES.each do |input_type|
      context "for a #{input_type} field" do
        subject(:field) { build(:custom_field, input_type: input_type) }

        it 'returns the value returned by the visitor' do
          expect(field.accept(visitor)).to eq "#{input_type} from visitor"
        end
      end
    end

    context 'for an unsupported field type' do
      subject(:field) { build(:custom_field, input_type: 'unsupported') }

      it 'raises an error' do
        expect { field.accept(visitor) }.to raise_error 'Unsupported input type: unsupported'
      end
    end
  end

  describe 'title_multiloc behaviour for ideation page 1' do
    it 'returns a title containing the current ideation/budget phase input term if there is a current phase' do
      project = create(:project_with_current_phase, current_phase_attrs: { input_term: 'question' })
      resource = build(:custom_form, participation_context: project)
      ignored_title = { en: 'anything' }
      page = described_class.new(
        resource: resource,
        input_type: 'page',
        code: 'title_page',
        title_multiloc: ignored_title
      )
      expected_english_title = 'What is your question?'
      expect(page.title_multiloc['en']).to eq expected_english_title
    end

    it 'returns a title containing the last phase input term if there is not a current ideation/budget phase' do
      project = create(:project_with_future_phases)
      project.phases.last.update! input_term: 'contribution'
      resource = build(:custom_form, participation_context: project)

      ignored_title = { en: 'anything' }
      page = described_class.new(
        resource: resource,
        input_type: 'page',
        code: 'title_page',
        title_multiloc: ignored_title
      )
      expected_english_title = 'What is your contribution?'
      expect(page.title_multiloc['en']).to eq expected_english_title
    end
  end

  describe 'visible_to_public?' do
    it 'returns true for a default input field' do
      field = build(:custom_field, :for_custom_form, input_type: 'text_multiloc', code: 'title_multiloc')
      expect(field.visible_to_public?).to be true
    end

    it 'returns false for a custom input field' do
      field = build(:custom_field, :for_custom_form, input_type: 'number')
      expect(field.visible_to_public?).to be false
    end

    it 'returns true for a custom input page' do
      field = build(:custom_field_page, :for_custom_form)
      expect(field.visible_to_public?).to be true
    end

    it 'returns true for a custom input end page' do
      field = build(:custom_field_form_end_page, :for_custom_form)
      expect(field.visible_to_public?).to be true
    end

    it 'returns false for a default registration field' do
      field = build(:custom_field_birthyear)
      expect(field.visible_to_public?).to be false
    end

    it 'returns false for a custom registration field' do
      field = build(:custom_field_select, :for_registration)
      expect(field.visible_to_public?).to be false
    end

    it 'returns true for a custom registration page' do
      field = build(:custom_field_page, :for_registration)
      expect(field.visible_to_public?).to be true
    end

    it 'returns true for a custom registration end page' do
      field = build(:custom_field_form_end_page, :for_registration)
      expect(field.visible_to_public?).to be true
    end
  end

  describe 'maximum_select_count' do
    let(:field) { create(:custom_field_multiselect, :with_options) }

    it 'cannot be less than 0' do
      field.maximum_select_count = -1
      expect(field.valid?).to be false
    end
  end

  describe 'minimum_select_count' do
    let(:field) { create(:custom_field_multiselect, :with_options) }

    it 'cannot be less than 0' do
      field.minimum_select_count = -1
      expect(field.valid?).to be false
    end
  end

  describe '#other_option_text_field' do
    let(:field) { create(:custom_field_multiselect, :with_options, key: 'select_field') }

    it 'returns a text field when the field has an other option' do
      create(:custom_field_option, custom_field: field, key: 'other', other: true, title_multiloc: { en: 'Something else', 'fr-FR': 'Quelque chose' })
      other_option_text_field = field.other_option_text_field
      expect(other_option_text_field).not_to be_nil
      expect(other_option_text_field.key).to eq 'select_field_other'
      expect(other_option_text_field.input_type).to eq 'text'
      expect(other_option_text_field.title_multiloc['en']).to eq 'Type your answer'
      expect(other_option_text_field.title_multiloc['fr-FR']).to eq 'Tapez votre réponse'
    end

    it 'returns nil otherwise' do
      expect(field.other_option_text_field).to be_nil
    end
  end

  describe '#linear_scale_print_description' do
    let(:field) do
      create(
        :custom_field_linear_scale,
        maximum: 3,
        linear_scale_label_1_multiloc: { en: 'Bad', 'fr-FR': 'Mauvais' },
        linear_scale_label_2_multiloc: { en: 'Neutral', 'fr-FR': 'Neutre' },
        linear_scale_label_3_multiloc: { en: 'Good', 'fr-FR': 'Bon' },
        linear_scale_label_4_multiloc: {
          en: 'Not in use (beyond maximum)', 'fr-FR': 'Non utilisé (au-delà du maximum)'
        },
        linear_scale_label_5_multiloc: {
          en: 'Not in use (beyond maximum)', 'fr-FR': 'Non utilisé (au-delà du maximum)'
        },
        linear_scale_label_6_multiloc: {
          en: 'Not in use (beyond maximum)', 'fr-FR': 'Non utilisé (au-delà du maximum)'
        },
        linear_scale_label_7_multiloc: {
          en: 'Not in use (beyond maximum)', 'fr-FR': 'Non utilisé (au-delà du maximum)'
        }
      )
    end

    it 'returns the linear scale print description for the specified locale' do
      expect(field.linear_scale_print_description('en')).to eq 'Please write a number between 1 (Bad) and 3 (Good) only'
      expect(field.linear_scale_print_description('fr-FR'))
        .to eq 'Veuillez écrire un nombre entre 1 (Mauvais) et 3 (Bon) uniquement'
    end

    it 'returns default copy if the locale values is/are not specified' do
      field.linear_scale_label_1_multiloc = { en: '' }
      field.linear_scale_label_3_multiloc = { en: '' }

      expect(field.linear_scale_print_description('en')).to eq 'Please write a number between 1 and 3 only'
      expect(field.linear_scale_print_description('fr-FR')).to eq 'Veuillez écrire un nombre entre 1 et 3 uniquement'
    end
  end

  describe '#nth_linear_scale_multiloc' do
    let(:field) do
      create(
        :custom_field_linear_scale,
        linear_scale_label_3_multiloc: { en: 'I am label 3 multiloc' },
        linear_scale_label_7_multiloc: { en: 'I am label 7 multiloc' }
      )
    end

    it 'returns the nth linear scale label multiloc' do
      expect(field.nth_linear_scale_multiloc(3)).to eq({ 'en' => 'I am label 3 multiloc' })
      expect(field.nth_linear_scale_multiloc(7)).to eq({ 'en' => 'I am label 7 multiloc' })
    end
  end

  describe '#average_rankings' do
    let!(:field) { create(:custom_field_ranking) }
    let!(:option1) { create(:custom_field_option, custom_field: field, key: 'by_foot') }
    let!(:option2) { create(:custom_field_option, custom_field: field, key: 'by_bike') }
    let!(:option3) { create(:custom_field_option, custom_field: field, key: 'by_train') }
    let!(:option4) { create(:custom_field_option, custom_field: field, key: 'by_horse') }

    it 'works' do
      create(:idea, custom_field_values: { field.key => %w[by_bike by_horse by_train by_foot] })
      create(:idea, custom_field_values: { field.key => %w[by_train by_bike by_foot by_horse] })
      create(:idea, custom_field_values: {})
      create(:idea, custom_field_values: { field.key => %w[by_horse by_foot by_train by_bike] })
      create(:idea, custom_field_values: { field.key => %w[by_bike by_foot by_train by_horse] })
      excluded_idea = create(:idea, custom_field_values: { field.key => %w[by_bike by_horse by_foot by_train] })

      expect(field.average_rankings(Idea.where.not(id: [excluded_idea.id]))).to eq({
        'by_bike' => 2,
        'by_foot' => 2.75,
        'by_train' => 2.5,
        'by_horse' => 2.75
      })
    end
  end

  describe '#rankings_counts' do
    let!(:field) { create(:custom_field_ranking) }
    let!(:option1) { create(:custom_field_option, custom_field: field, key: 'by_foot') }
    let!(:option2) { create(:custom_field_option, custom_field: field, key: 'by_bike') }
    let!(:option3) { create(:custom_field_option, custom_field: field, key: 'by_train') }
    let!(:option4) { create(:custom_field_option, custom_field: field, key: 'by_horse') }

    it 'works' do
      create(:user, custom_field_values: { field.key => %w[by_bike by_horse by_train by_foot] })
      create(:user, custom_field_values: { field.key => %w[by_train by_bike by_foot by_horse] })
      create(:user, custom_field_values: {})
      create(:user, custom_field_values: { field.key => %w[by_horse by_foot by_train by_bike] })
      create(:user, custom_field_values: { field.key => %w[by_bike by_foot by_train by_horse] })
      excluded_user = create(:user, custom_field_values: { field.key => %w[by_bike by_horse by_foot by_train] })

      expect(field.rankings_counts(User.where.not(id: [excluded_user.id]))).to eq({
        'by_foot' => {
          1 => 0,
          2 => 2,
          3 => 1,
          4 => 1
        },
        'by_bike' => {
          1 => 2,
          2 => 1,
          3 => 0,
          4 => 1
        },
        'by_train' => {
          1 => 1,
          2 => 0,
          3 => 3,
          4 => 0
        },
        'by_horse' => {
          1 => 1,
          2 => 1,
          3 => 0,
          4 => 2
        }
      })
    end
  end

  describe 'question_category' do
    let(:form) { create(:custom_form, participation_context: TimelineService.new.current_phase(project)) }
    let(:field) { create(:custom_field, resource: form) }

    context 'community_monitor_survey project' do
      let(:project) { create(:community_monitor_project) }

      it 'can have an allowed category associated' do
        field.question_category = 'quality_of_life'
        expect(field).to be_valid
      end

      it 'cannot have a topic if it is not in the list of allowed topics' do
        field.question_category = 'monkeys'
        expect(field).not_to be_valid
        expect(field.errors.first.type).to eq :inclusion
      end

      it 'returns "other" if the question category is not set' do
        field.question_category = nil
        expect(field.question_category).to eq 'other'
      end

      it 'returns the multiloc for the question' do
        field.question_category = 'quality_of_life'
        expect(field.question_category_multiloc['en']).to eq 'Quality of life'
      end
    end

    context 'native_survey project' do
      let(:project) { create(:project_with_active_native_survey_phase) }

      it 'cannot have topics associated if the participation method does not allow it' do
        field.question_category = 'quality_of_life'
        expect(field).not_to be_valid
        expect(field.errors.first.type).to eq :present
      end

      it 'returns nil if the question category is not set' do
        field.question_category = nil
        expect(field.question_category).to be_nil
      end

      it 'returns nil for question_category_multiloc' do
        expect(field.question_category_multiloc).to be_nil
      end
    end
  end

  describe 'maximum' do
    context 'linear scale fields' do
      it 'is valid when maximum is between 2 & 11' do
        field = build(:custom_field_linear_scale, maximum: 5)
        expect(field).to be_valid
      end

      it 'is not valid when maximum is nil' do
        field = build(:custom_field_linear_scale, maximum: nil)
        expect(field).not_to be_valid
      end

      it 'is not valid when maximum is greater than 11' do
        field = build(:custom_field_linear_scale, maximum: 16)
        expect(field).not_to be_valid
      end
    end

    context 'other fields' do
      it 'is valid when maximum is nil' do
        field = build(:custom_field_multiselect, maximum: nil)
        expect(field).to be_valid
      end
    end
  end
end
