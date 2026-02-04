# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminApi::CopyProjectJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    # Ensure no DefaultInputTopics exist, as they would be added to imported projects
    # via set_default_input_topics!, causing model counts to differ from the template.
    before_all { DefaultInputTopic.delete_all }
    before { DefaultInputTopic.delete_all }

    let_it_be(:template) do
      # No images, nor files because their URLs won't be available
      project = create(:project_xl, phases_count: 3, images_count: 0, files_count: 0)
      template = ProjectCopyService.new.export(project)
      project.destroy!

      template
    end
    let_it_be(:template_yaml) { template.to_yaml }

    let(:folder) { create(:project_folder) }

    example 'imports a project' do
      expect { job.perform(template_yaml, folder.id) }.to change(Project, :count).by(1)
      expect(folder.projects.count).to eq 1

      project = folder.projects.sole

      project_title = template.dig('models', 'project', 0, 'title_multiloc', 'en')
      expect(project.title_multiloc['en']).to eq(project_title)

      serialized_project = ProjectCopyService.new.export(project)
      model_counts = serialized_project['models'].transform_values(&:size)
      expected_model_counts = template['models'].transform_values(&:size)
      expect(model_counts).to eq(expected_model_counts)
    end

    example 'delays the destruction of the job record once it is finished' do
      # rubocop:disable RSpec/SubjectStub
      expect(job).to receive(:destroy_in).with(15.minutes).and_call_original
      # rubocop:enable RSpec/SubjectStub

      job.perform(template_yaml)
    end

    context 'when outside the context of a tenant' do
      before { Apartment::Tenant.reset }

      it 'raises an error' do
        expect { job.perform(template_yaml, folder.id) }.to raise_error(
          RuntimeError,
          "#{described_class.name} must be run in the context of a tenant."
        )
      end
    end
  end
end
