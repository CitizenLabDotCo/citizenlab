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
end

RSpec.describe CustomField, type: :model do
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

  describe 'title_multiloc validation' do
    let(:form) { create :custom_form }

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
  end

  context 'hooks' do
    it 'generates a key on creation, if not specified' do
      cf = create(:custom_field, key: nil)
      expect(cf.key).to be_present
    end

    describe 'saving a custom field without title_multiloc' do
      it 'produces validation errors on the key and the title_multiloc' do
        form = create :custom_form
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
        subject(:field) { build :custom_field, input_type: input_type }

        it 'returns the value returned by the visitor' do
          expect(field.accept(visitor)).to eq "#{input_type} from visitor"
        end
      end
    end

    context 'for an unsupported field type' do
      subject(:field) { build :custom_field, input_type: 'unsupported' }

      it 'raises an error' do
        expect { field.accept(visitor) }.to raise_error 'Unsupported input type: unsupported'
      end
    end
  end
end
