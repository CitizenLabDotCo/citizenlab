# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::TenantDeserializer do
  let(:service) { described_class.new }

  describe '#deserialize' do
    it 'associates refs correctly, when the target of the ref has exactly the same attributes' do
      yml = <<~YAML
        ---
        models:
          project:
          - &3
            title_multiloc:
              en: Project 1
          - &4
            title_multiloc:
              en: Project 2
          custom_form:
          - &1
            created_at: 2020-02-18 22:46:33 UTC
            updated_at: 2020-02-18 22:46:33 UTC
            participation_context_ref: *3
          - &2
            created_at: 2020-02-18 22:46:33 UTC
            updated_at: 2020-02-18 22:46:33 UTC
            participation_context_ref: *4
          custom_field:
            - resource_type: CustomForm
              resource_ref: *1
              key: body_multiloc
              input_type: multiline_text
              title_multiloc:
                en: Description
              description_multiloc:
                nl-BE: Debitis expedita qui nostrum.
              code: body_multiloc
            - resource_type: CustomForm
              resource_ref: *2
              key: title_multiloc
              input_type: text
              title_multiloc:
                en: Description
              description_multiloc:
                nl-BE: Minima et ipsa debitis.
              code: title_multiloc
      YAML

      template = YAML.load(yml) # rubocop:disable Security/YAMLLoad

      service.deserialize(template)

      expect(CustomForm.count).to eq 2
      expect(CustomField.count).to eq 2
      expect(CustomField.all.map(&:resource)).to match_array CustomForm.all
    end

    it 'associates attribute refs correctly' do
      yml = <<~YAML
        ---
        models:
          project_folders/folder:
          - title_multiloc:
              en: Folder title
            admin_publication_attributes: &1
              publication_status: published
          project:
            - title_multiloc:
                en: Project 1 title
              admin_publication_attributes:
                publication_status: published
                parent_attributes_ref: *1
            - title_multiloc:
                en: Project 2 title
              admin_publication_attributes:
                publication_status: published
                parent_attributes_ref: *1
      YAML

      template = YAML.load(yml) # rubocop:disable Security/YAMLLoad

      service.deserialize(template)

      expect(ProjectFolders::Folder.count).to eq 1
      expect(Project.count).to eq 2
      expect(Project.all.map { |pj| pj.folder&.id }.uniq).to eq [ProjectFolders::Folder.first.id]
    end

    describe 'filtering of template multiloc attributes' do
      let(:platform_locales) { ['en'] }
      let(:template) do
        # Allows aliases and deserialization of Time object
        YAML.safe_load(<<~YAML, [Time], [], true)
          models:
            project:
              - &project
                title_multiloc:
                  en: Project
                  nl-BE: Project
            idea_status:
              - title_multiloc: idea_statuses.proposed
                ordering: 100
                code: proposed
                color: '#687782'
                description_multiloc: idea_statuses.proposed_description
            idea:
              - title_multiloc:
                  en: Cleaning the sidewalks party
                  nl-BE: Schoonmaken van de trottoirs feest
                body_multiloc:
                  en: "<p>Let's get together to have a cleaning party!<p>"
                  nl-BE: "<p>Laten we samen een schoonmaakfeest houden!<p>"
                publication_status: published
                location_description: 8185 Austen Green
                project_ref: *project
                published_at: '2018-03-03 00:00:00'
                created_at: '2018-02-22 00:00:00'
                updated_at: '2018-03-28 13:35:10'
        YAML
      end

      before do
        app_config = AppConfiguration.instance
        app_config.settings['core']['locales'] = platform_locales
        app_config.save!
      end

      it 'removes non-platform locales from citizen inputs' do
        service.deserialize(template)

        idea = Idea.first
        expect(idea.title_multiloc.keys).to eq(platform_locales)
        expect(idea.body_multiloc.keys).to eq(platform_locales)
      end

      it 'does not remove locales from other models (non-citizen inputs)' do
        service.deserialize(template)

        project = Project.first
        expect(project.title_multiloc.keys).to eq(%w[en nl-BE])
      end

      it 'falls back to another (unspecified) locale if all locales are filtered out' do
        template.dig('models', 'idea', 0, 'body_multiloc').except!(*platform_locales)

        service.deserialize(template)

        idea = Idea.first
        expect(idea.body_multiloc.keys).to contain_exactly('nl-BE')
      end
    end
  end
end
