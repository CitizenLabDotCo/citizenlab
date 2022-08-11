# frozen_string_literal: true

require 'rails_helper'

class TestVisitorWithDefault < FieldVisitorService
  def default(_field)
    'default value'
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

    let(:field) { instance_double CustomField }

    describe '#visit_text' do
      it 'returns the default' do
        expect(visitor.visit_text(field)).to eq 'default value'
      end
    end

    describe '#visit_number' do
      it 'returns the default' do
        expect(visitor.visit_number(field)).to eq 'default value'
      end
    end

    describe '#visit_multiline_text' do
      it 'returns the default' do
        expect(visitor.visit_multiline_text(field)).to eq 'default value'
      end
    end

    describe '#visit_html' do
      it 'returns the default' do
        expect(visitor.visit_html(field)).to eq 'default value'
      end
    end

    describe '#visit_text_multiloc' do
      it 'returns the default' do
        expect(visitor.visit_text_multiloc(field)).to eq 'default value'
      end
    end

    describe '#visit_multiline_text_multiloc' do
      it 'returns the default' do
        expect(visitor.visit_multiline_text_multiloc(field)).to eq 'default value'
      end
    end

    describe '#visit_html_multiloc' do
      it 'returns the default' do
        expect(visitor.visit_html_multiloc(field)).to eq 'default value'
      end
    end

    describe '#visit_select' do
      it 'returns the default' do
        expect(visitor.visit_select(field)).to eq 'default value'
      end
    end

    describe '#visit_multiselect' do
      it 'returns the default' do
        expect(visitor.visit_multiselect(field)).to eq 'default value'
      end
    end

    describe '#visit_checkbox' do
      it 'returns the default' do
        expect(visitor.visit_checkbox(field)).to eq 'default value'
      end
    end

    describe '#visit_date' do
      it 'returns the default' do
        expect(visitor.visit_date(field)).to eq 'default value'
      end
    end

    describe '#visit_files' do
      it 'returns the default' do
        expect(visitor.visit_files(field)).to eq 'default value'
      end
    end

    describe '#visit_image_files' do
      it 'returns the default' do
        expect(visitor.visit_image_files(field)).to eq 'default value'
      end
    end

    describe '#visit_point' do
      it 'returns the default' do
        expect(visitor.visit_point(field)).to eq 'default value'
      end
    end
  end
end
