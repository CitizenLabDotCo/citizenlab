require 'rails_helper'

describe CustomFieldsValidationService do
  let(:service) { described_class.new }
  let(:custom_form) { create(:custom_form) }
  let(:participation_method) { custom_form.participation_context.pmethod }
  let(:default_fields) do
    # Deal with title page default title being nil (not the case during API call)
    participation_method.default_fields(custom_form).each { |field| field[:title_multiloc] = field.title_multiloc }
  end
  let(:fields) { default_fields }
  let(:result) { service.validate(fields, participation_method) }

  it 'accepts the default fields' do
    expect(result).to be_nil
  end

  describe 'validate_non_empty_form' do
    context do
      let(:fields) { [] }

      it 'rejects an empty form' do
        expect(result).to eq({ form: [{ error: 'empty' }] })
      end
    end
  end

  describe 'validate_first_page' do
    context do
      let(:fields) { [build(:custom_field_number), build(:custom_field_page)] }

      it 'rejects a form without a first page' do
        expect(result).to eq({ form: [{ error: 'no_first_page' }] })
      end
    end
  end

  describe 'validate_end_page' do
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
    let(:fields) do
      default_fields.reject { |f| excluded_codes.include?(f.code) }
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
    context do
      let(:fields) do
        default_fields
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
        default_fields
          .reject { |f| f.code == 'body_page' }
          .tap { |fields| fields.find { |f| f.code == 'body_multiloc' }.enabled = false }
      end

      it 'accepts a form with deleted page and disabled locked children' do
        expect(result).to be_nil
      end
    end

    context do
      let(:fields) do
        default_fields.tap do |fields|
          disable_codes = %w[body_page body_multiloc]
          fields.select { |f| disable_codes.include?(f.code) }.each { |f| f.enabled = false }
        end
      end

      it 'accepts a form with disabled page and locked children' do
        expect(result).to be_nil
      end
    end

    context do
      let(:fields) do
        default_fields.insert(2, build(:custom_field_number))
      end

      it 'rejects a form with an added locked child' do
        expect(result).to eq({ form: [{ error: 'locked_children' }] })
      end
    end

    context do
      let(:fields) do
        default_fields.reject { |f| f.code == 'body_multiloc' }
      end

      it 'rejects a form without a deleted locked child' do
        expect(result).to eq({ form: [{ error: 'locked_children' }] })
      end
    end

    context do
      let(:fields) do
        default_fields.tap do |fields|
          fields.find { |f| f.code == 'body_multiloc' }.enabled = false
        end
      end

      it 'rejects a form without a disabled locked child' do
        expect(result).to eq({ form: [{ error: 'locked_children' }] })
      end
    end
  end

  describe 'validate_attributes' do
    context do
      let(:fields) do
        default_fields.tap do |fields|
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
        default_fields.tap do |fields|
          fields.find { |f| f.code == 'location_description' }.title_multiloc = { 'en' => 'Changed title' }
        end
      end

      it 'rejects a form with a changed locked title' do
        expect(result).to eq({ form: [{ error: 'locked_attribute' }] })
      end
    end

    context do
      let(:fields) do
        default_fields.tap do |fields|
          fields.find { |f| f.code == 'title_multiloc' }.required = false
        end
      end

      it 'rejects a form with a changed locked required attribute' do
        expect(result).to eq({ form: [{ error: 'locked_attribute' }] })
      end
    end
  end
end
