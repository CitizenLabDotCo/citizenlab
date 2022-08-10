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
end

RSpec.describe CustomField, type: :model do
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

    context 'for a text field' do
      subject(:field) { build :custom_field, input_type: 'text' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'text from visitor'
      end
    end

    context 'for a number field' do
      subject(:field) { build :custom_field, input_type: 'number' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'number from visitor'
      end
    end

    context 'for a multiline_text field' do
      subject(:field) { build :custom_field, input_type: 'multiline_text' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'multiline_text from visitor'
      end
    end

    context 'for a html field' do
      subject(:field) { build :custom_field, input_type: 'html' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'html from visitor'
      end
    end

    context 'for a text_multiloc field' do
      subject(:field) { build :custom_field, input_type: 'text_multiloc' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'text_multiloc from visitor'
      end
    end

    context 'for a multiline_text_multiloc field' do
      subject(:field) { build :custom_field, input_type: 'multiline_text_multiloc' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'multiline_text_multiloc from visitor'
      end
    end

    context 'for a html_multiloc field' do
      subject(:field) { build :custom_field, input_type: 'html_multiloc' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'html_multiloc from visitor'
      end
    end

    context 'for a select field' do
      subject(:field) { build :custom_field, input_type: 'select' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'select from visitor'
      end
    end

    context 'for a multiselect field' do
      subject(:field) { build :custom_field, input_type: 'multiselect' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'multiselect from visitor'
      end
    end

    context 'for a checkbox field' do
      subject(:field) { build :custom_field, input_type: 'checkbox' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'checkbox from visitor'
      end
    end

    context 'for a date field' do
      subject(:field) { build :custom_field, input_type: 'date' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'date from visitor'
      end
    end

    context 'for a files field' do
      subject(:field) { build :custom_field, input_type: 'files' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'files from visitor'
      end
    end

    context 'for an image_files field' do
      subject(:field) { build :custom_field, input_type: 'image_files' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'image_files from visitor'
      end
    end

    context 'for a point field' do
      subject(:field) { build :custom_field, input_type: 'point' }

      it 'returns the value returned by the visitor' do
        expect(field.accept(visitor)).to eq 'point from visitor'
      end
    end

    context 'for an unsupported field type' do
      subject(:field) { build :custom_field, input_type: 'unsupported' }

      it 'raises an error' do
        expect { field.accept(visitor)}.to raise_error 'Unsupported input type: unsupported'
      end
    end
  end
end
