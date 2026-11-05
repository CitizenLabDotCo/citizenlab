# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'demos:translate_slugs rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['demos:translate_slugs'].reenable
    # The task writes its JSON report to the working directory.
    FileUtils.rm_f(Rails.root.join('translate_slugs.json'))
  end

  def run_task(execute: false, host: Tenant.current.host, locale: 'nl-BE')
    Rake::Task['demos:translate_slugs'].invoke(host, locale, execute ? 'execute' : nil)
  end

  describe 'dry-run mode' do
    it 'does not modify any slugs' do
      project = create(:project, title_multiloc: { 'en' => 'English title', 'nl-BE' => 'Nederlandse titel' }, slug: 'english-title')

      run_task(execute: false)

      expect(project.reload.slug).to eq('english-title')
    end

    it 'reports the changes that would be applied' do
      create(:project, title_multiloc: { 'en' => 'English title', 'nl-BE' => 'Nederlandse titel' }, slug: 'english-title')

      expect { run_task(execute: false) }.to output(/WOULD UPDATE slug for Project/).to_stdout
    end
  end

  describe 'execute mode' do
    # Execute mode only applies changes on demo platforms or in development. The default
    # test tenant is 'active' and the model forbids flipping it to 'demo', so stub the
    # lifecycle_stage the guard reads (passing other settings lookups through).
    before do
      allow_any_instance_of(AppConfiguration).to receive(:settings).and_call_original
      allow_any_instance_of(AppConfiguration)
        .to receive(:settings).with('core', 'lifecycle_stage').and_return('demo')
    end

    it 'derives the slug from the title in the target locale' do
      project = create(:project, title_multiloc: { 'en' => 'English title', 'nl-BE' => 'Nederlandse titel' }, slug: 'english-title')

      run_task(execute: true)

      expect(project.reload.slug).to eq('nederlandse-titel')
    end

    it 'translates slugs for projects, static pages, folders and groups' do
      project = create(:project, title_multiloc: { 'en' => 'A', 'nl-BE' => 'Project NL' }, slug: 'a')
      static_page = create(:static_page, title_multiloc: { 'en' => 'B', 'nl-BE' => 'Pagina NL' }, slug: 'b')
      folder = create(:project_folder, title_multiloc: { 'en' => 'C', 'nl-BE' => 'Map NL' }, slug: 'c')
      group = create(:group, title_multiloc: { 'en' => 'D', 'nl-BE' => 'Groep NL' })

      run_task(execute: true)

      expect(project.reload.slug).to eq('project-nl')
      expect(static_page.reload.slug).to eq('pagina-nl')
      expect(folder.reload.slug).to eq('map-nl')
      expect(group.reload.slug).to eq('groep-nl')
    end

    context 'when a record has no title in the target locale' do
      it 'leaves the slug unchanged and reports it as skipped' do
        project = create(:project, title_multiloc: { 'en' => 'Only English' }, slug: 'only-english')

        expect { run_task(execute: true) }.to output(/SKIPPED: No nl-BE title_multiloc/).to_stdout
        expect(project.reload.slug).to eq('only-english')
      end
    end

    context 'when the slugified title already matches the current slug' do
      it 'leaves the slug unchanged' do
        project = create(:project, title_multiloc: { 'en' => 'X', 'nl-BE' => 'Already Correct' }, slug: 'already-correct')

        expect { run_task(execute: true) }.to output(/UNCHANGED: Project/).to_stdout
        expect(project.reload.slug).to eq('already-correct')
      end
    end

    context 'idea slugs' do
      it 'translates the slug of an ideation idea' do
        idea = create(:idea, title_multiloc: { 'en' => 'English idea', 'nl-BE' => 'Nederlands idee' }, slug: 'english-idea')

        run_task(execute: true)

        expect(idea.reload.slug).to eq('nederlands-idee')
      end

      it 'does not translate the slug of a native survey response' do
        create(:idea_status_proposed) # required when creating a native survey response
        response = create(:native_survey_response, title_multiloc: { 'en' => 'Survey response', 'nl-BE' => 'Enquête antwoord' })
        original_slug = response.slug

        run_task(execute: true)

        expect(response.reload.slug).to eq(original_slug)
      end
    end

    context 'when a custom StaticPage translated slug would be reserved' do
      it 'leaves the slug unchanged and reports it as skipped' do
        page = create(
          :static_page,
          code: 'custom',
          title_multiloc: { 'en' => 'Some custom page', 'nl-BE' => 'About' },
          slug: 'some-custom-page'
        )

        expect { run_task(execute: true) }.to output(/translated slug 'about' is reserved/).to_stdout
        expect(page.reload.slug).to eq('some-custom-page')
      end
    end

    context 'when the record fails to save' do
      it 'leaves the slug unchanged and logs an error' do
        project = create(:project, title_multiloc: { 'en' => 'English title', 'nl-BE' => 'Nederlandse titel' }, slug: 'english-title')
        allow_any_instance_of(Project).to receive(:update!).and_raise('Error updating slug')

        expect { run_task(execute: true) }.to output(/ERROR! Failed to update Project/).to_stdout
        expect(project.reload.slug).to eq('english-title')
      end
    end

    it 'does not change user slugs' do
      user = create(:user)
      original_slug = user.slug

      run_task(execute: true)

      expect(user.reload.slug).to eq(original_slug)
    end
  end

  describe 'lifecycle guard' do
    # The default test tenant has lifecycle_stage 'active', and tests run outside the
    # development env, so execute mode is blocked here.
    it 'refuses to apply changes on a non-demo tenant outside development' do
      project = create(:project, title_multiloc: { 'en' => 'English title', 'nl-BE' => 'Nederlandse titel' }, slug: 'english-title')

      expect { run_task(execute: true) }.to output(/Execute mode is only allowed on demo platforms/).to_stdout
      expect(project.reload.slug).to eq('english-title')
    end

    it 'still allows a dry run on a non-demo tenant' do
      create(:project, title_multiloc: { 'en' => 'English title', 'nl-BE' => 'Nederlandse titel' }, slug: 'english-title')

      expect { run_task(execute: false) }.to output(/WOULD UPDATE slug for Project/).to_stdout
    end
  end

  describe 'argument validation' do
    it 'aborts when no host is given' do
      expect { run_task(host: nil) }.to output(/Both host and locale arguments are required/).to_stdout
    end

    it 'aborts when no tenant matches the host' do
      expect { run_task(host: 'does-not-exist.example.com') }.to output(/No tenant found/).to_stdout
    end
  end
end
# rubocop:enable RSpec/DescribeClass
