# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CitizenLab::Mixins::FeatureSpecification do

  let(:allowed_enabled_props) do
    {
      'allowed' => { 'type' => 'boolean', 'default' => true },
      'enabled' => { 'type' => 'boolean', 'default' => true }
    }
  end

  describe 'Simple feature specification' do
    let(:feature_spec) do
      Module.new do
        extend CitizenLab::Mixins::FeatureSpecification

        def self.feature_name
          'co_authorship'
        end

        def self.feature_title
          'Co-authorship'
        end
      end
    end

    describe '.json_schema' do
      let(:json_schema) { feature_spec.json_schema }

      it { expect(json_schema['title']).to eq(feature_spec.feature_title) }
      it { expect(json_schema).not_to have_key('required-settings') }
      it { expect(json_schema).not_to have_key('description') }
      it { expect(json_schema['properties']).to eq(allowed_enabled_props) }
    end

    describe '.settings' do
      it { expect(feature_spec.settings).to be_empty }
    end

    describe '.required_settings' do
      it { expect(feature_spec.required_settings).to be_empty }
    end

    describe '.settings_props' do
      it { expect(feature_spec.settings_props).to be_empty }
    end
  end

  describe 'Complex feature specification' do

    # Settings schemas
    let(:live_edit_schema) { { 'type' => 'boolean' } }
    let(:max_nb_authors_schema) { { 'type' => 'number', 'default' => 0 } }

    let(:feature_spec) do
      # Store schemas in local vars, bc helpers are undefined inside the +Module.new+ block
      live_edit_schema_ = live_edit_schema
      max_nb_authors_schema_ = max_nb_authors_schema

      Module.new do
        extend CitizenLab::Mixins::FeatureSpecification

        def self.feature_name
          'co_authorship'
        end

        def self.feature_title
          'Co-authorship'
        end

        def self.feature_description
          <<~DESC
            Allow submissions to be co-authored. All co-authors have write 
            permission on the submission.
          DESC
        end

        add_setting 'live_edit', required: true, schema: live_edit_schema_
        add_setting 'max_nb_authors', schema: max_nb_authors_schema_
      end
    end

    describe '.json_schema' do
      let(:json_schema) { feature_spec.json_schema }

      it { expect(json_schema['title']).to eq(feature_spec.feature_title) }
      it { expect(json_schema['required-settings']).to eq(['live_edit']) }
      it { expect(json_schema['description']).to eq(feature_spec.feature_description) }

      it { expect(json_schema['properties']).to include('max_nb_authors' => max_nb_authors_schema) }
      it { expect(json_schema['properties']).to include('live_edit' => live_edit_schema) }
      it { expect(json_schema['properties']).to include(allowed_enabled_props) }
    end

    describe '.settings' do
      let(:first_setting) { feature_spec.settings.first }

      it { expect(feature_spec.settings.length).to eq(2) }

      it do
        expect(first_setting).to have_attributes(
          name: 'live_edit',
          required: true,
          schema: live_edit_schema)
      end
    end

    describe '.required_settings' do
      it { expect(feature_spec.required_settings).to eq(['live_edit']) }
    end

    describe '.settings_props' do
      let(:expected_props) do
        {
          'live_edit' => live_edit_schema,
          'max_nb_authors' => max_nb_authors_schema
        }
      end

      it { expect(feature_spec.settings_props).to match(expected_props) }
    end
  end
end
