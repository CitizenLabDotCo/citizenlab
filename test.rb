a = []
b = [2, 4]

puts 'yes' unless a&.any? { |x| b.include?(x) }
