# frozen_string_literal: true

require 'rails_helper'

describe Export::InputReportFields do
  describe 'for a native survey phase' do
    let(:phase) { create(:native_survey_phase) }
    let!(:custom_form) { create(:custom_form, participation_context: phase) }
    let!(:question) { create(:custom_field_select, :with_options, resource: custom_form, key: 'q_select') }
    # `custom_field` defaults to a registration (resource_type User) field.
    let!(:registration_field) { create(:custom_field, key: 'residence', title_multiloc: { 'en' => 'Residence' }) }

    before do
      create(:custom_field_option, custom_field: question, key: 'other', title_multiloc: { 'en' => 'Other' }, other: true)
      create(:custom_field_page, resource: custom_form)
      question.options.reload
    end

    def keys_of(fields)
      fields.map(&:key)
    end

    describe '#all' do
      subject(:all_keys) { keys_of(described_class.new(phase).all) }

      it 'starts with the input id column' do
        expect(all_keys.first).to eq 'input_id'
      end

      it 'includes the question, its derived "other" answer, author and meta columns and user fields' do
        expect(all_keys).to include('q_select', 'q_select_other', 'author_id', 'submitted_at', 'project', 'residence')
      end

      it 'excludes page fields' do
        input_types = described_class.new(phase).all.filter_map { |field| field.try(:input_type) }
        expect(input_types).not_to include('page')
      end
    end

    describe '#reviewable_fields' do
      subject(:reviewable) { described_class.new(phase).reviewable_fields }

      it 'lists questions and user fields once, without their derived columns' do
        expect(reviewable.map(&:key)).to include('q_select', 'residence')
        expect(reviewable.map(&:key)).not_to include('q_select_other')
      end

      it 'carries the underlying custom field for form/user fields only' do
        by_key = reviewable.index_by(&:key)
        expect(by_key['q_select'].custom_field).to be_present
        expect(by_key['input_id'].custom_field).to be_nil
      end

      it 'structurally flags the author columns as personal data, other computed columns not' do
        by_key = reviewable.index_by(&:key)
        expect(by_key['author_email'].personal_data).to be true
        expect(by_key['author_id'].personal_data).to be true
        expect(by_key['submitted_at'].personal_data).to be false
      end

      it 'localizes the titles' do
        by_key = reviewable.index_by(&:key)
        expect(by_key['residence'].title).to eq 'Residence'
        expect(by_key['author_email'].title).to be_a(String)
      end
    end

    describe 'redaction' do
      it 'drops a redacted question together with its derived "other" answer' do
        fields = described_class.new(phase, redacted_field_keys: ['q_select'])
        expect(keys_of(fields.all)).not_to include('q_select', 'q_select_other')
      end

      it 'drops a redacted user field' do
        fields = described_class.new(phase, redacted_field_keys: ['residence'])
        expect(keys_of(fields.all)).not_to include('residence')
      end

      it 'drops a redacted computed column by its key' do
        fields = described_class.new(phase, redacted_field_keys: ['author_email'])
        expect(keys_of(fields.all)).not_to include('author_email')
        expect(keys_of(described_class.new(phase).all)).to include('author_email')
      end

      it 'does not affect other fields' do
        fields = described_class.new(phase, redacted_field_keys: ['q_select'])
        expect(keys_of(fields.all)).to include('input_id', 'residence', 'author_email')
      end
    end

    describe 'participation location columns' do
      let(:location_keys) do
        %w[
          participation_location_country participation_location_region participation_location_city
          participation_location_latitude participation_location_longitude
        ]
      end

      before do
        create(:idea_status_proposed)
        SettingsService.new.activate_feature!('participation_location_tracking')
        phase.project.update!(track_participation_location: true)
      end

      it 'are the last columns when tracking is on for the project' do
        expect(keys_of(described_class.new(phase).all).last(location_keys.size)).to eq location_keys
      end

      it 'read the location recorded for the input' do
        input = create(:native_survey_response, project: phase.project, creation_phase: phase)
        create(
          :participation_location,
          trackable: input,
          country_name: 'Belgium',
          region: 'Brussels-Capital Region',
          city: 'Brussels',
          latitude: BigDecimal('50.8503'),
          longitude: BigDecimal('4.3517')
        )
        input.reload

        values = described_class.new(phase).all
          .select { |field| location_keys.include?(field.key) }
          .to_h { |field| [field.key, field.value_from(input)] }

        expect(values).to eq(
          'participation_location_country' => 'Belgium',
          'participation_location_region' => 'Brussels-Capital Region',
          'participation_location_city' => 'Brussels',
          'participation_location_latitude' => 50.8503,
          'participation_location_longitude' => 4.3517
        )
      end

      it 'are blank for an input posted anonymously' do
        input = create(:native_survey_response, project: phase.project, creation_phase: phase, anonymous: true)
        create(:participation_location, trackable: input, city: 'Brussels')
        city_field = described_class.new(phase).all.find { |field| field.key == 'participation_location_city' }

        expect(city_field.value_from(input.reload)).to be_nil
      end

      it 'are kept for an input that has no author but is not anonymous' do
        input = create(:native_survey_response, project: phase.project, creation_phase: phase, author: nil)
        create(:participation_location, trackable: input, city: 'Brussels')
        city_field = described_class.new(phase).all.find { |field| field.key == 'participation_location_city' }

        expect(input.reload.anonymous).to be false
        expect(city_field.value_from(input)).to eq 'Brussels'
      end

      it 'are empty for an input without a recorded location' do
        input = create(:native_survey_response, project: phase.project, creation_phase: phase)
        city_field = described_class.new(phase).all.find { |field| field.key == 'participation_location_city' }

        expect(city_field.value_from(input)).to be_nil
      end

      it 'are excluded when the feature is off' do
        SettingsService.new.deactivate_feature!('participation_location_tracking')
        expect(keys_of(described_class.new(phase).all)).not_to include(*location_keys)
      end

      it 'are excluded when the project does not track location' do
        phase.project.update!(track_participation_location: false)
        expect(keys_of(described_class.new(phase).all)).not_to include(*location_keys)
      end

      it 'are excluded when private attributes are left out of exports' do
        config = AppConfiguration.instance
        config.settings['core']['private_attributes_in_export'] = false
        config.save!

        expect(keys_of(described_class.new(phase).all)).not_to include(*location_keys)
      end

      it 'flag the city and coordinates as personal data for review' do
        by_key = described_class.new(phase).reviewable_fields.index_by(&:key)
        expect(by_key['participation_location_city'].personal_data).to be true
        expect(by_key['participation_location_latitude'].personal_data).to be true
        expect(by_key['participation_location_country'].personal_data).to be false
      end
    end
  end

  describe 'for an ideation phase' do
    subject(:all_keys) { described_class.new(phase).all.map(&:key) }

    let(:project) { create(:single_phase_ideation_project) }
    let(:phase) { project.phases.first }
    let!(:custom_form) { create(:custom_form, participation_context: project) }

    it 'renders title and body with a fallback locale' do
      idea = create(:idea, project: project, phases: [phase], title_multiloc: { 'en' => 'My idea' })
      title_field = described_class.new(phase).all.find { |field| field.key == 'title_multiloc' }

      expect(title_field.value_from(idea)).to eq 'My idea'
    end

    it 'places latitude/longitude ahead of the location answer' do
      expect(all_keys.index('latitude')).to be < all_keys.index('location_description')
      expect(all_keys.index('longitude')).to be < all_keys.index('location_description')
    end

    it 'drops the coordinate columns when the location question is redacted' do
      redacted = described_class.new(phase, redacted_field_keys: ['location_description'])
      expect(redacted.all.map(&:key)).not_to include('location_description', 'latitude', 'longitude')
    end

    it 'includes the private author columns' do
      expect(all_keys).to include('author_fullname', 'author_email')
    end

    it 'does not list the coordinate columns for review' do
      expect(described_class.new(phase).reviewable_fields.map(&:key)).not_to include('latitude', 'longitude')
    end
  end
end
