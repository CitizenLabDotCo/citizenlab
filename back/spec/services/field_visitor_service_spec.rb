# frozen_string_literal: true

require 'rails_helper'

class TestVisitorWithDefault < FieldVisitorService
  def default(field)
    "default value for #{field.input_type}"
  end
end

RSpec.describe FieldVisitorService do
  subject(:visitor) { described_class.new }

  describe '#visit' do
    it 'asks the field to accept the visitor' do
      result = double
      field = instance_double CustomField, accept: result
      expect(field).to receive(:accept).with(visitor)
      expect(visitor.visit(field)).to eq result
    end
  end

  describe '#default' do
    let(:field) { instance_double CustomField }

    it 'returns nil' do
      expect(visitor.default(field)).to be_nil
    end
  end

  describe 'each #visit_xxx method invokes #default' do
    subject(:visitor) { TestVisitorWithDefault.new }

    let(:field) { instance_double CustomField, input_type: input_type }

    describe '#visit_text' do
      let(:input_type) { 'text' }

      it 'returns the default' do
        expect(visitor.visit_text(field)).to eq 'default value for text'
      end
    end

    describe '#visit_number' do
      let(:input_type) { 'number' }

      it 'returns the default' do
        expect(visitor.visit_number(field)).to eq 'default value for number'
      end
    end

    describe '#visit_multiline_text' do
      let(:input_type) { 'multiline_text' }

      it 'returns the default' do
        expect(visitor.visit_multiline_text(field)).to eq 'default value for multiline_text'
      end
    end

    describe '#visit_html' do
      let(:input_type) { 'html' }

      it 'returns the default' do
        expect(visitor.visit_html(field)).to eq 'default value for html'
      end
    end

    describe '#visit_text_multiloc' do
      let(:input_type) { 'text_multiloc' }

      it 'returns the default' do
        expect(visitor.visit_text_multiloc(field)).to eq 'default value for text_multiloc'
      end
    end

    describe '#visit_multiline_text_multiloc' do
      let(:input_type) { 'multiline_text_multiloc' }

      it 'returns the default' do
        expect(visitor.visit_multiline_text_multiloc(field)).to eq 'default value for multiline_text_multiloc'
      end
    end

    describe '#visit_html_multiloc' do
      let(:input_type) { 'html_multiloc' }

      it 'returns the default' do
        expect(visitor.visit_html_multiloc(field)).to eq 'default value for html_multiloc'
      end
    end

    describe '#visit_select' do
      let(:input_type) { 'select' }

      it 'returns the default' do
        expect(visitor.visit_select(field)).to eq 'default value for select'
      end
    end

    describe '#visit_multiselect' do
      let(:input_type) { 'multiselect' }

      it 'returns the default' do
        expect(visitor.visit_multiselect(field)).to eq 'default value for multiselect'
      end
    end

    describe '#visit_checkbox' do
      let(:input_type) { 'checkbox' }

      it 'returns the default' do
        expect(visitor.visit_checkbox(field)).to eq 'default value for checkbox'
      end
    end

    describe '#visit_date' do
      let(:input_type) { 'date' }

      it 'returns the default' do
        expect(visitor.visit_date(field)).to eq 'default value for date'
      end
    end

    describe '#visit_files' do
      let(:input_type) { 'files' }

      it 'returns the default' do
        expect(visitor.visit_files(field)).to eq 'default value for files'
      end
    end

    describe '#visit_image_files' do
      let(:input_type) { 'image_files' }

      it 'returns the default' do
        expect(visitor.visit_image_files(field)).to eq 'default value for image_files'
      end
    end

    describe '#visit_point' do
      let(:input_type) { 'point' }

      it 'returns the default' do
        expect(visitor.visit_point(field)).to eq 'default value for point'
      end
    end
  end
end
