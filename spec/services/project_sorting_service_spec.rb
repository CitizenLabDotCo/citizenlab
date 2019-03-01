require "rails_helper"

describe ProjectSortingService do
  let(:service) { ProjectSortingService.new }

  describe "sort" do
    context "when manual sorting is enabled" do
      before do
        tenant = Tenant.current
        tenant.settings['manual_project_sorting'] = {allowed: true, enabled: true}
        tenant.save
      end

      it "respects the saved ordering" do
        Project.acts_as_list_no_update do
          p4 = create(:project, ordering: 0, publication_status: 'archived')
          p1 = create(:project, ordering: 2)
          p2 = create(:project, ordering: 1)
          p3 = create(:project, ordering: 3)
          expect(service.sort(Project.all).ids).to eq [p2, p1, p3, p4].map(&:id)
        end
      end
    end

    context "when manual sorting is disabled" do
      before do
        tenant = Tenant.current
        tenant.settings['manual_project_sorting'] = {allowed: true, enabled: false}
        tenant.save
      end

      it "sorts the projects in the specced order" do
        t = Date.today
        projects = [
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-2.weeks,
                  end_at: t+1.days,
                  participation_method: 'information',
                }
              )},
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-2.weeks,
                  end_at: t+2.days,
                  participation_method: 'information',
                }
              )},
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-3.days,
                  end_at: t+3.day,
                  participation_method: 'ideation',
                }
              )},
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-2.weeks,
                  end_at: t+2.weeks,
                  participation_method: 'ideation'
                }
              )},
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-2.weeks,
                  end_at: t+2.weeks,
                  participation_method: 'budgeting',
                  max_budget: 1000,
                }
              )},
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-2.weeks,
                  end_at: t+2.weeks,
                  participation_method: 'survey',
                  survey_service: 'google_forms',
                  survey_embed_url: 'https://docs.google.com/forms/d/e/abcd/viewform?embedded=true'
                }
              )},
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-2.weeks,
                  end_at: t+2.weeks,
                  participation_method: 'ideation',
                  posting_enabled: false
                }
              )},
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-2.weeks,
                  end_at: t+2.weeks,
                  participation_method: 'ideation',
                  posting_enabled: false,
                  commenting_enabled: false
                }
              )},
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-2.weeks,
                  end_at: t+2.weeks,
                  participation_method: 'ideation',
                  posting_enabled: false,
                  commenting_enabled: false,
                  voting_enabled: false
                }
              )},
          -> {create(:project_with_current_phase,
                phases_config: { sequence: 'xcx' },
                current_phase_attrs: {
                  start_at: t-2.weeks,
                  end_at: t+2.weeks,
                  participation_method: 'information',
                }
              )},
          -> {create(:continuous_project, participation_method: 'ideation', created_at: t-3.weeks)},
          -> {create(:continuous_project, participation_method: 'information', created_at: t-3.weeks)},
          -> {create(:project_with_future_phases, first_start_at: t + 1.month)},
          -> {create(:project_with_past_phases, last_end_at: t - 2.months)},
          -> {create(:continuous_project, publication_status: 'archived', created_at: t-5.weeks)},
          -> {create(:project_with_past_phases, publication_status: 'archived', last_end_at: t-6.weeks)},
          -> {create(:continuous_project, publication_status: 'archived', created_at: t-3.year)},
        ].map.with_index{|lambda, i| [i, lambda]}
          .shuffle
          .map{|(ordering, lambda)| [ordering, lambda.call.tap{|pr| pr.update!(slug: ordering)}]}
          .sort_by(&:first)
          .map(&:last)

        sorted_projects = service.sort(Project.all)

        expect(sorted_projects.count).to eq Project.count
        expect(sorted_projects.pluck(:slug)).to eq projects.map(&:slug)

        # Check the SQL implementation against the ruby reference implementation
        projects.each do |project|
          expect(project.project_sort_score.score).to eq service.sort_score(project)
        end
      end
    end

    describe "order_by_publication_status" do
      before do
        6.times do |i|
          create(:project, publication_status: %w(draft published archived)[i%3])
        end
      end

      it "return draft, published and archived projects in that order" do
        expect(service.order_by_publication_status(Project.all).map(&:publication_status).chunk(&:itself).map(&:first)).to eq %w(draft published archived)
      end

      it "succeeds when applied to a scope that used distinct" do
        projects = Project.distinct

        expect(service.order_by_publication_status(projects).map(&:publication_status).chunk(&:itself).map(&:first)).to eq %w(draft published archived)
      end

    end
  end

end