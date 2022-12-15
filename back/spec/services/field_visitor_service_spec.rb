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

  CustomField::INPUT_TYPES.each do |input_type|
    message = "visit_#{input_type}"
    describe "##{message}" do
      subject(:visitor) { TestVisitorWithDefault.new }

      let(:field) { instance_double CustomField, input_type: input_type }

      it "returns the default for '#{input_type}'" do
        expect(visitor.public_send(message, field)).to eq "default value for #{input_type}"
      end
    end
  end
end
