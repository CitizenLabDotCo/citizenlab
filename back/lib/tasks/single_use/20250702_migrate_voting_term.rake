namespace :single_use do
  desc 'Configures the voting_term based on the existing voting_term_singular_multiloc and voting_term_plural_multiloc attributes of phases.'
  task :update_voting_term, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    Tenant.safe_switch_each do |tenant|
      puts "\nProcessing tenant #{tenant.host} \n\n"

      map_to_term = {
        'vote' => ['vote', 'stem', 'stimme', 'voto', 'voorkeur', 'äänestys', 'stemme', 'ster', '"pouvoir"', 'fördela', 'prioriteit', 'votar'],
        'point' => %w[point punkt punt],
        'token' => ['token'],
        'credit' => ['credit', '"crédit carbone"']
      }

      map_to_term.each do |term, strings|
        strings.each do |search_value|
          # Find phases with the search value in any locale, case-insensitive
          phases = Phase.where('EXISTS (SELECT 1 FROM jsonb_each_text(voting_term_singular_multiloc) WHERE LOWER(value) = LOWER(?))', search_value)

          if phases.any?
            puts "..Found #{phases.count} phases with '#{search_value}', setting vote_term to '#{term}'"

            if execute
              begin
                updated = phases.update_all(vote_term: term)
                puts "  OK: Updated #{updated} phases to '#{term}'" if execute
              rescue StandardError => e
                puts "  ERROR! Failed to update phases for '#{search_value}': #{e.message}"
              end
            end
          end
        end
      end
    end
  end
end
