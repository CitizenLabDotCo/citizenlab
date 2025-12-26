require 'rails_helper'

describe Export::Geojson::ValueVisitor do
  subject(:visitor) do
    described_class.new(model, option_index)
  end

  let(:option_index) { {} }
  let(:model) { instance_double Idea, custom_field_values: { field_key => 'John' } }
  let(:field) { create(:custom_field, input_type: 'text', key: field_key) }

  describe '#default' do
    context 'for a built-in field' do
      let(:field) do
        create(
          :custom_field,
          input_type: 'number',
          key: 'proposed_budget',
          code: 'proposed_budget'
        )
      end
      let(:model) { instance_double Idea, proposed_budget: 1234 }

      it 'returns the field value from the model' do
        expect(visitor.default(field)).to eq 1234
      end
    end

    context 'for a non built-in field' do
      let(:field_key) { 'name' }
      let(:field) { create(:custom_field, input_type: 'text', key: field_key) }
      let(:model) { instance_double Idea, custom_field_values: { field_key => 'John' } }

      it 'returns the field value from custom_field_values' do
        expect(visitor.default(field)).to eq 'John'
      end
    end
  end

  context 'visit_xxx methods' do
    let(:field_key) { 'field_1' }
    let(:code) { nil }
    let(:resource_type) { 'CustomForm' }
    let!(:field) do
      create(
        :custom_field,
        resource_type: resource_type,
        input_type: input_type,
        key: field_key,
        code: code
      )
    end
    let(:model) { instance_double Idea, custom_field_values: { field_key => value } }

    describe '#visit_text' do
      let(:input_type) { 'text' }

      context 'when there is no value' do
        let(:value) { nil }

        it 'returns nil' do
          expect(visitor.visit_text(field)).to be_nil
        end
      end

      context 'when there is a value' do
        let(:value) { 'John' }

        it 'returns the value for the report' do
          expect(visitor.visit_text(field)).to eq value
        end
      end
    end

    describe '#visit_number' do
      let(:input_type) { 'number' }

      context 'when there is no value' do
        let(:value) { nil }

        it 'returns nil' do
          expect(visitor.visit_number(field)).to be_nil
        end
      end

      context 'when there is a value' do
        let(:value) { 1000 }

        it 'returns the value for the report' do
          expect(visitor.visit_number(field)).to eq value
        end
      end
    end

    describe '#visit_multiline_text' do
      let(:input_type) { 'multiline_text' }

      context 'when there is no value' do
        let(:value) { nil }

        it 'returns nil' do
          expect(visitor.visit_multiline_text(field)).to be_nil
        end
      end

      context 'when there is a value' do
        let(:value) { "line 1\nline 2" }

        it 'returns the value for the report' do
          expect(visitor.visit_multiline_text(field)).to eq value
        end
      end
    end

    describe '#visit_select' do
      let(:input_type) { 'select' }

      context 'when the code is domicile' do
        let(:resource_type) { 'User' }
        let(:code) { 'domicile' }
        let(:field_key) { :domicile }
        let(:model) { create(:user, field_key => value) }

        context 'when there is no value' do
          let(:value) { nil }

          it 'returns nil' do
            I18n.with_locale('nl-NL') do
              expect(visitor.visit_select(field)).to be_nil
            end
          end
        end

        context 'when there is a value' do
          let!(:area) { create(:area, title_multiloc: { 'en' => 'Paris', 'nl-NL' => 'Parijs' }) }
          let(:value) { area.id }
          let(:option_index) do
            {
              area.id => area
            }
          end

          it 'returns the value for the report' do
            I18n.with_locale('nl-NL') do
              expect(visitor.visit_select(field)).to eq 'Parijs'
            end
          end
        end
      end

      context 'when the code is not domicile' do
        let!(:field_option1) do
          create(
            :custom_field_option,
            custom_field: field,
            key: 'cat',
            title_multiloc: { 'en' => 'Cat', 'nl-NL' => 'Kat' }
          )
        end
        let!(:field_option2) do
          create(
            :custom_field_option,
            custom_field: field,
            key: 'dog',
            title_multiloc: { 'en' => 'Dog', 'nl-NL' => 'Hond' }
          )
        end
        let(:option_index) do
          {
            field_option1.key => field_option1,
            field_option2.key => field_option2
          }
        end

        context 'when there is no value' do
          let(:value) { nil }

          it 'returns nil' do
            I18n.with_locale('nl-NL') do
              expect(visitor.visit_select(field)).to be_nil
            end
          end
        end

        context 'when there is a value' do
          let(:value) { 'cat' }

          it 'returns the value for the report' do
            I18n.with_locale('nl-NL') do
              expect(visitor.visit_select(field)).to eq 'Kat'
            end
          end
        end
      end
    end

    describe '#visit_multiselect' do
      let(:input_type) { 'multiselect' }
      let!(:field_option1) do
        create(
          :custom_field_option,
          custom_field: field,
          key: 'cat',
          title_multiloc: { 'en' => 'Cat', 'nl-NL' => 'Kat' }
        )
      end
      let!(:field_option2) do
        create(
          :custom_field_option,
          custom_field: field,
          key: 'dog',
          title_multiloc: { 'en' => 'Dog', 'nl-NL' => 'Hond' }
        )
      end
      let(:option_index) do
        {
          field_option1.key => field_option1,
          field_option2.key => field_option2
        }
      end

      context 'when there are no options selected' do
        let(:value) { [] }

        it 'returns nil' do
          I18n.with_locale('nl-NL') do
            expect(visitor.visit_multiselect(field)).to be_nil
          end
        end
      end

      context 'when there is one option selected' do
        let(:value) { ['dog'] }

        it 'returns the value for the report' do
          I18n.with_locale('nl-NL') do
            expect(visitor.visit_multiselect(field)).to eq ['Hond']
          end
        end
      end

      context 'when there are multiple options selected' do
        let(:value) { %w[cat dog] }

        it 'returns the value for the report' do
          I18n.with_locale('nl-NL') do
            expect(visitor.visit_multiselect(field)).to eq %w[Kat Hond]
          end
        end
      end
    end

    describe '#visit_multiselect_image' do
      let(:input_type) { 'multiselect_image' }
      let!(:field_option1) do
        create(
          :custom_field_option,
          custom_field: field,
          key: 'cat',
          title_multiloc: { 'en' => 'Cat' }
        ).tap do |option|
          option.update!(image: create(:custom_field_option_image, custom_field_option: option))
        end
      end
      let!(:field_option2) do
        create(
          :custom_field_option,
          custom_field: field,
          key: 'dog',
          title_multiloc: { 'en' => 'Dog' }
        ).tap do |option|
          option.update!(image: create(:custom_field_option_image, custom_field_option: option))
        end
      end
      let(:option_index) do
        {
          field_option1.key => field_option1,
          field_option2.key => field_option2
        }
      end

      context 'when there are no options selected' do
        let(:value) { [] }

        it 'returns nil' do
          I18n.with_locale('en') do
            expect(visitor.visit_multiselect(field)).to be_nil
          end
        end
      end

      context 'when there is one option selected' do
        let(:value) { ['dog'] }

        it 'returns the value for the report' do
          I18n.with_locale('en') do
            expect(visitor.visit_multiselect(field)).to eq ['Dog']
          end
        end
      end

      context 'when there are multiple options selected' do
        let(:value) { %w[cat dog] }

        it 'returns the value for the report' do
          I18n.with_locale('en') do
            expect(visitor.visit_multiselect(field)).to eq %w[Cat Dog]
          end
        end
      end
    end

    describe '#visit_point' do
      let(:input_type) { 'point' }
      let(:value) do
        {
          'type' => 'Point',
          'coordinates' => [11.11, 22.22]
        }
      end

      it 'returns the GeoJSON value' do
        expect(visitor.visit_point(field)).to eq({
          'type' => 'Point',
          'coordinates' => [11.11, 22.22]
        })
      end
    end

    describe '#visit_line' do
      let(:input_type) { 'line' }
      let(:value) do
        {
          'type' => 'LineString',
          'coordinates' => [[11.11, 22.22], [11.33, 22.44]]
        }
      end

      it 'returns the GeoJSON value' do
        expect(visitor.visit_line(field)).to eq({
          'type' => 'LineString',
          'coordinates' => [[11.11, 22.22], [11.33, 22.44]]
        })
      end
    end

    describe '#visit_polygon' do
      let(:input_type) { 'polygon' }
      let(:value) do
        {
          'type' => 'Polygon',
          'coordinates' => [[11.11, 22.22], [11.33, 22.44], [12.33, 23.44], [11.11, 22.22]]
        }
      end

      it 'returns the GeoJSON value' do
        expect(visitor.visit_polygon(field))
          .to eq({
            'type' => 'Polygon',
            'coordinates' => [[11.11, 22.22], [11.33, 22.44], [12.33, 23.44], [11.11, 22.22]]
          })
      end
    end

    describe '#visit_file_upload' do
      let(:input_type) { 'file_upload' }

      context 'when there is no value' do
        let(:value) { nil }

        it 'returns nil' do
          I18n.with_locale('nl-NL') do
            expect(visitor.visit_file_upload(field)).to be_nil
          end
        end
      end

      context 'when there is a value' do
        before { create(:idea_status_proposed) }

        let(:model) { create(:native_survey_response) }
        let!(:file) { create(:idea_file, name: 'File1.pdf', idea: model) }

        it 'returns the value for the report' do
          model.update!(custom_field_values: { field_key => { 'id' => file.id, 'name' => file.name } })
          expect(visitor.visit_file_upload(field)).to eq file.file.url
        end
      end
    end

    describe '#visit_shapefile_upload' do
      let(:input_type) { 'shapefile_upload' }

      context 'when there is no value' do
        let(:value) { nil }

        it 'returns nil' do
          I18n.with_locale('nl-NL') do
            expect(visitor.visit_shapefile_upload(field)).to be_nil
          end
        end
      end

      context 'when there is a value' do
        before { create(:idea_status_proposed) }

        let(:model) { create(:native_survey_response) }
        let!(:file) { create(:idea_file, name: 'File1.pdf', idea: model) }

        it 'returns the value for the report' do
          model.update!(custom_field_values: { field_key => { 'id' => file.id, 'name' => file.name } })
          expect(visitor.visit_shapefile_upload(field)).to eq file.file.url
        end
      end
    end
  end
end
