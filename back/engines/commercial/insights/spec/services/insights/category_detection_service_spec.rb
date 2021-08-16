# frozen_string_literal: true

require 'rails_helper'

describe Insights::CategoryDetectionService do
  describe '#detect_categories' do
    subject(:service) { described_class.new(nlp_client) }
    let(:nlp_client) { instance_double(NLP::Api, 'nlp_client') }

    let(:response) {[
      {
        "text" => "kaggle",
        "frequency" => 11
      },
      {
        "text" => "google",
        "frequency" => 10
      }
    ]}

    context 'no input' do
      let(:view) { create(:view) }
      it "returns [] when there's no input" do
        allow(nlp_client).to receive(:project_tag_suggestions).and_return(response)
        result = service.detect_categories(view)

        expect(result).to eq []
      end
    end

    context 'some input' do
      let(:ideas) { create_list(:idea, 3) }
      let(:project) { create(:project, ideas: ideas) }
      let(:view) { create(:view, scope: project) }

      context 'no previous detected_categories' do
        it 'returns [] and creates nothing when there\'s no suggestions' do
          allow(nlp_client).to receive(:project_tag_suggestions).and_return(nil)
          result = service.detect_categories(view)

          aggregate_failures 'check results' do
            expect(result.length).to eq(0)
            expect(Insights::DetectedCategory.where(view: view).length).to eq 0
          end
        end

        it 'returns [] and lets detected_categories unchanged when there\'s no suggestions' do
          allow(nlp_client).to receive(:project_tag_suggestions).and_return([])
          result = service.detect_categories(view)

          aggregate_failures 'check results' do
            expect(result.length).to eq(0)
            expect(Insights::DetectedCategory.where(view: view).length).to eq 0
          end
        end

        it 'returns categories which replaced previously detected when there are suggestions' do
          allow(nlp_client).to receive(:project_tag_suggestions).and_return(response)
          result = service.detect_categories(view)

          aggregate_failures 'check results' do
            expect(result.length).to eq(2)
            expect(Insights::DetectedCategory.where(view: view).length).to eq 2
          end
        end
      end

      context 'some previous detected_categories' do
        let(:detected_category) { create(:detected_category, view: view) }

        it 'returns [] and lets detected_categories unchanged when there\'s no suggestions' do
          allow(nlp_client).to receive(:project_tag_suggestions).and_return(nil)
          result = service.detect_categories(view)

          aggregate_failures 'check results' do
            expect(result.length).to eq(0)
            expect(Insights::DetectedCategory.where(view: view)).to match [detected_category]
          end
        end

        it 'returns [] and lets detected_categories unchanged when there\'s no suggestions' do
          allow(nlp_client).to receive(:project_tag_suggestions).and_return([])
          result = service.detect_categories(view)

          aggregate_failures 'check results' do
            expect(result.length).to eq(0)
            expect(Insights::DetectedCategory.where(view: view)).to match [detected_category]
          end
        end

        it 'returns categories which replaced previously detected when there are suggestions' do
          allow(nlp_client).to receive(:project_tag_suggestions).and_return(response)
          result = service.detect_categories(view)

          aggregate_failures 'check results' do
            expect(result.length).to eq(2)
            expect(Insights::DetectedCategory.where(view: view).length).to eq 2
          end
        end
      end
    end
  end

  describe '#top_locale' do
    subject(:service) { described_class.new }
    let(:ideas) { create_list(:idea, 3) }

    describe 'with mostly english' do
      before do
        ideas[0].body_multiloc = { "en" => "Some english" }
        ideas[1].body_multiloc = { "en" => "Some english", "fr-BE" => "Du français" }
        ideas[2].body_multiloc = { "en" => "Some english" }
      end
      it 'gets the right locale' do
        expect(service.top_locale(ideas)).to eq("en")
      end
    end

    describe 'with only nl' do
      before do
        ideas[0].body_multiloc = { "nl-BE" => "Some nl-BEglish" }
        ideas[1].body_multiloc = { "nl-BE" => "Some nl-BEglish" }
        ideas[2].body_multiloc = { "nl-BE" => "Some nl-BEglish" }
      end
      it 'gets the right locale' do
        expect(service.top_locale(ideas)).to eq("nl-BE")
      end
    end

    describe 'with mostly french' do
      before do
        ideas[1].body_multiloc = { "en" => "Some english", "fr-BE" => "Du français" }
        ideas[0].body_multiloc = { "fr-BE" => "Du français" }
        ideas[2].body_multiloc = { "en" => "Some english", "fr-BE" => "Du français" }
      end
      it 'gets the right locale' do
        expect(service.top_locale(ideas)).to eq("fr-BE")
      end
    end
  end
end
