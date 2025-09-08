require 'rails_helper'

describe CustomFieldsValidationService do
  let(:service) { described_class.new }
  let(:custom_form) { create(:custom_form) }
  let(:participation_method) { custom_form.participation_context.pmethod }
  let(:fields) { participation_method.default_fields(custom_form) }
  let(:result) { service.validate(fields, participation_method) }

  describe 'validate_non_empty_form' do
    it 'accepts the default fields' do
      expect(result).to be_nil
    end

    context do
      let(:fields) { [] }

      it 'rejects an empty form' do
        expect(result).to eq({ form: [{ error: 'empty' }] })
      end
    end
  end

  describe 'validate_first_page' do
    it 'accepts the default fields' do
      expect(result).to be_nil
    end

    context do
      let(:fields) { [build(:custom_field_number), build(:custom_field_page)] }

      it 'rejects a form without a first page' do
        expect(result).to eq({ form: [{ error: 'no_first_page' }] })
      end
    end
  end

  describe 'validate_end_page' do
    it 'accepts the default fields' do
      expect(result).to be_nil
    end

    context do
      let(:fields) { [build(:custom_field_page), build(:custom_field_number)] }

      it 'rejects a form where the last field is not a page' do
        expect(result).to eq({ form: [{ error: 'no_end_page' }] })
      end
    end

    context do
      let(:fields) { [build(:custom_field_page), build(:custom_field_number), build(:custom_field_page)] }

      it 'rejects a form where the last field is a page but not an end page' do
        expect(result).to eq({ form: [{ error: 'no_end_page' }] })
      end
    end

    context do
      let(:fields) { [build(:custom_field_form_end_page), build(:custom_field_page)] }

      it 'rejects a form where the end page is not the last page' do
        expect(result).to eq({ form: [{ error: 'no_end_page' }] })
      end
    end
  end

  describe 'validate_deletions' do
    let(:excluded_codes) { [] }
    let(:fields) do
      participation_method.default_fields(custom_form).reject { |f| excluded_codes.include?(f.code) }
    end

    it 'accepts the default fields' do
      expect(result).to be_nil
    end

    context do
      let(:excluded_codes) { %w[body_page body_multiloc] }

      it 'accepts a form without the body page and field' do
        expect(result).to be_nil
      end
    end

    context do
      let(:excluded_codes) { %w[title_multiloc] }

      it 'rejects a form without the title field' do
        expect(result).to eq({ form: [{ error: 'locked_deletion' }] })
      end
    end

    context do
      let(:excluded_codes) { %w[title_page title_multiloc] }

      it 'rejects a form without the title page and field' do
        expect(result).to eq({ form: [{ error: 'locked_deletion' }] })
      end
    end
  end

  describe 'validate_children' do
    it 'accepts the default fields' do
      expect(result).to be_nil
    end

    context do
      let(:fields) do
        participation_method.default_fields(custom_form)
          .insert(5, build(:custom_field_number))
          .reject { |f| f.code == 'idea_images_attributes' }
          .tap { |fields| fields.find { |f| f.code == 'idea_files_attributes' }.enabled = false }
      end

      it 'accepts a form with a added and deleted unlocked children' do
        expect(result).to be_nil
      end
    end

    context do
      let(:fields) do
        participation_method.default_fields(custom_form).insert(2, build(:custom_field_number))
      end

      it 'rejects a form with an added locked child' do
        expect(result).to eq({ form: [{ error: 'locked_children' }] })
      end
    end

    context do
      let(:fields) do
        participation_method.default_fields(custom_form).reject { |f| f.code == 'body_multiloc' }
      end

      it 'rejects a form without a deleted locked child' do
        expect(result).to eq({ form: [{ error: 'locked_children' }] })
      end
    end

    context do
      let(:fields) do
        participation_method.default_fields(custom_form).tap do |fields|
          fields.find { |f| f.code == 'body_multiloc' }.enabled = false
        end
      end

      it 'rejects a form without a disabled locked child' do
        expect(result).to eq({ form: [{ error: 'locked_children' }] })
      end
    end
  end

  describe 'validate_attributes' do
    it 'accepts the default fields' do
      expect(result).to be_nil
    end

    context do
      let(:fields) do
        participation_method.default_fields(custom_form).tap do |fields|
          fields.find { |f| f.code == 'body_page' }.title_multiloc = { 'en' => 'Changed title' }
          fields.find { |f| f.code == 'topic_ids' }.required = true
        end
      end

      it 'accepts a form with a changed unlocked title and required attribute' do
        expect(result).to be_nil
      end
    end

    context do
      let(:fields) do
        participation_method.default_fields(custom_form).tap do |fields|
          fields.find { |f| f.code == 'location_description' }.title_multiloc = { 'en' => 'Changed title' }
        end
      end

      it 'rejects a form with a changed locked title' do
        expect(result).to eq({ form: [{ error: 'locked_attribute' }] })
      end
    end

    context do
      let(:fields) do
        participation_method.default_fields(custom_form).tap do |fields|
          fields.find { |f| f.code == 'title_multiloc' }.required = false
        end
      end

      it 'rejects a form with a changed locked required attribute' do
        expect(result).to eq({ form: [{ error: 'locked_attribute' }] })
      end
    end
  end
end
