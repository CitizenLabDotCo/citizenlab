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

  def visit_multiselect(_field)
    'multiselect from visitor'
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

  def visit_linear_scale(_field)
    'linear_scale from visitor'
  end

  def visit_page(_field)
    'page from visitor'
  end

  def visit_section(_field)
    'section from visitor'
  end

  def visit_topic_ids(_field)
    'topic_ids from visitor'
  end

  def visit_file_upload(_field)
    'file_upload from visitor'
  end
end

RSpec.describe CustomField do
  let(:field) { described_class.new input_type: 'not_important_for_this_test' }

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

  describe '#section?' do
    it 'returns true when the input_type is "section"' do
      section_field = described_class.new input_type: 'section'
      expect(section_field.section?).to be true
    end

    it 'returns false otherwise' do
      other_field = described_class.new input_type: 'something_else'
      expect(other_field.section?).to be false
    end
  end

  describe '#page_or_section?' do
    it 'returns true when the input_type is "page"' do
      page_field = described_class.new input_type: 'page'
      expect(page_field.page_or_section?).to be true
    end

    it 'returns true when the input_type is "section"' do
      section_field = described_class.new input_type: 'section'
      expect(section_field.page_or_section?).to be true
    end

    it 'returns false otherwise' do
      other_field = described_class.new input_type: 'something_else'
      expect(other_field.page_or_section?).to be false
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
        key: 'field_key',
        title_multiloc: { 'en' => '' }
      )
      expect(page_field.valid?).to be true

      page_field.title_multiloc = {}
      expect(page_field.valid?).to be true

      page_field.title_multiloc = nil
      expect(page_field.valid?).to be true
    end

    it 'does not happen when the field is a section' do
      section_field = described_class.new(
        resource: form,
        input_type: 'section',
        key: 'field_key',
        title_multiloc: { 'en' => '' }
      )
      expect(section_field.valid?).to be true

      section_field.title_multiloc = {}
      expect(section_field.valid?).to be true

      section_field.title_multiloc = nil
      expect(section_field.valid?).to be true
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
      expect(cf.key).to eq('abba')
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
  end

  describe 'description sanitizer' do
    it 'sanitizes script tags in the description' do
      custom_field = create(:custom_field, description_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script><p>But this should stay</p><a href="http://www.citizenlab.co" rel="nofollow">Click</a>'
      })
      expect(custom_field.description_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!<p>But this should stay</p><a href="http://www.citizenlab.co" rel="nofollow">Click</a>' })
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

  describe 'title_multiloc behaviour for ideation section 1' do
    context 'continuous projects' do
      it 'returns a title containing the project input term regardless of what it is set to' do
        resource = build(:custom_form)
        resource.participation_context.update! input_term: 'option'
        ignored_title = { en: 'anything' }
        section = described_class.new(
          resource: resource,
          input_type: 'section',
          code: 'ideation_section1',
          title_multiloc: ignored_title
        )
        expected_english_title = 'What is your option?'
        expect(section.title_multiloc['en']).to eq expected_english_title
      end
    end

    # Do budget too
    context 'timeline projects' do
      it 'returns a title containing the current ideation/budget phase input term if there is a current phase' do
        project = create(:project_with_current_phase, current_phase_attrs: { input_term: 'question' })
        resource = build(:custom_form, participation_context: project)
        ignored_title = { en: 'anything' }
        section = described_class.new(
          resource: resource,
          input_type: 'section',
          code: 'ideation_section1',
          title_multiloc: ignored_title
        )
        expected_english_title = 'What is your question?'
        expect(section.title_multiloc['en']).to eq expected_english_title
      end

      it 'returns a title containing the last phase input term if there is not a current ideation/budget phase' do
        project = create(:project_with_future_phases)
        project.phases.last.update! input_term: 'contribution'
        resource = build(:custom_form, participation_context: project)

        ignored_title = { en: 'anything' }
        section = described_class.new(
          resource: resource,
          input_type: 'section',
          code: 'ideation_section1',
          title_multiloc: ignored_title
        )
        expected_english_title = 'What is your contribution?'
        expect(section.title_multiloc['en']).to eq expected_english_title
      end
    end
  end

  describe 'field_visible_to' do
    context 'for an unsupported value' do
      it 'is not valid' do
        field = build(:custom_field, answer_visible_to: 'aliens')
        expect(field).not_to be_valid
      end
    end

    context 'when not set and is of type CustomForm' do
      let(:field) { build(:custom_field, resource_type: 'CustomForm') }

      it 'sets admins by default before validation' do
        field.validate!
        expect(field.answer_visible_to).to eq 'admins'
      end

      it 'sets public by default if field is a section' do
        field.input_type = 'section'
        field.validate!
        expect(field.answer_visible_to).to eq 'public'
      end

      it 'sets public by default if field is a page' do
        field.input_type = 'page'
        field.validate!
        expect(field.answer_visible_to).to eq 'public'
      end

      it 'sets public by default if the field is built-in' do
        field.code = 'title_multiloc'
        field.validate!
        expect(field.answer_visible_to).to eq 'public'
      end
    end

    context 'when not set and is of type User' do
      let(:field) { build(:custom_field, resource_type: 'User') }

      it 'always sets the value to "admins"' do
        field.input_type = 'page'
        field.input_type = 'section'
        field.code = 'gender'
        field.validate!
        expect(field.answer_visible_to).to eq 'admins'
      end
    end
  end

  describe 'maximum_select_count' do
    let(:field) { create(:custom_field_multiselect, :with_options) }

    it 'cannot exceed the number of options' do
      field.maximum_select_count = field.options.size + 1
      expect(field.valid?).to be false
    end

    it 'cannot be less than 0' do
      field.maximum_select_count = -1
      expect(field.valid?).to be false
    end
  end

  describe 'minimum_select_count' do
    let(:field) { create(:custom_field_multiselect, :with_options) }

    it 'cannot exceed the number of options' do
      field.minimum_select_count = field.options.size + 1
      expect(field.valid?).to be false
    end
    
    it 'cannot be less than 0' do
      field.minimum_select_count = -1
      expect(field.valid?).to be false
    end
  end
end
