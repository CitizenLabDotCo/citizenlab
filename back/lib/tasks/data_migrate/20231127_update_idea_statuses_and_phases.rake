# frozen_string_literal: true

# bin/rails "data_migrate:update_idea_statuses_and_phases['ideas.csv','participatie.leuven.be','nl-BE']"
namespace :data_migrate do
  desc 'Update Idea statuses and phases.'
  task :update_idea_statuses_and_phases, %i[url host locale] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      default_locale = args[:locale]
      statuses = IdeaStatus.all.to_a
      find_status_by_title = ->(title) { statuses.find { _1.title_multiloc >= { default_locale => title } } }
      create_status_by_title = lambda do |title, color|
        IdeaStatus.find_or_create_by!(
          title_multiloc: { default_locale => title },
          description_multiloc: { default_locale => title },
          color: color,
          code: 'custom'
        )
      end

      statuses_mapping = {
        'verder onderzocht' => find_status_by_title.call('Wordt onderzocht'),
        'uitgevoerd' => find_status_by_title.call('uitgevoerd'),
        'afgesloten/wordt niet verder onderzocht' => find_status_by_title.call('Afgesloten'),
        'ingepland' => find_status_by_title.call('Ingepland'),
        'uitvoering in 2024' => create_status_by_title.call('Uitvoering in 2023', '#216db7'),
        'uitvoering in 2023' => create_status_by_title.call('Uitvoering in 2024', '#b721a7')
      }

      ideas = Idea.all.to_a

      data.each do |d|
        title = d['Titel'].strip
        body = d['Beschrijving'].strip
        ideas = Idea.select { _1.title_multiloc.value?(title) && _1.body_multiloc.value?(body) }
        # Useful for testing:
        # ideas = [Idea.new(title_multiloc: { default_locale => title }, body_multiloc: { default_locale => body }, project: Project.order(created_at: :asc).last, publication_status: 'published')]

        if ideas.size != 1
          puts "ERROR: Found #{ideas.size} ideas with title '#{title}' and body '#{body.first(10)}..'. Skipping update."
          next
        end

        idea = ideas.first
        target_phase = idea.project.phases.last
        phase_included = idea.phases.include?(target_phase)
        idea.phases << target_phase unless phase_included
        idea.idea_status = statuses_mapping[d['nieuwe status'].strip]
        idea.save!

        puts "Updated idea '#{idea.id}' with status '#{idea.idea_status.code}, #{idea.idea_status.id}' and phase '#{target_phase.id}'. Previous status: '#{idea.idea_status_id_previously_was}', phase included: '#{phase_included}'."
      end
    end
  end
end
