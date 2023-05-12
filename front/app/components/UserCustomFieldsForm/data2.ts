export const data = {
  type: 'schema',
  attributes: {
    json_schema_multiloc: {
      en: {
        type: 'object',
        additionalProperties: false,
        properties: {
          gender: {
            type: 'string',
            oneOf: [
              {
                const: 'male',
                title: 'Male',
              },
              {
                const: 'female',
                title: 'Female',
              },
              {
                const: 'unspecified',
                title: 'Other',
              },
            ],
          },
          birthyear: {
            type: 'number',
            oneOf: [
              {
                const: 2011,
              },
              {
                const: 2010,
              },
              {
                const: 2009,
              },
              {
                const: 2008,
              },
              {
                const: 2007,
              },
              {
                const: 2006,
              },
              {
                const: 2005,
              },
              {
                const: 2004,
              },
              {
                const: 2003,
              },
              {
                const: 2002,
              },
              {
                const: 2001,
              },
              {
                const: 2000,
              },
              {
                const: 1999,
              },
              {
                const: 1998,
              },
              {
                const: 1997,
              },
              {
                const: 1996,
              },
              {
                const: 1995,
              },
              {
                const: 1994,
              },
              {
                const: 1993,
              },
              {
                const: 1992,
              },
              {
                const: 1991,
              },
              {
                const: 1990,
              },
              {
                const: 1989,
              },
              {
                const: 1988,
              },
              {
                const: 1987,
              },
              {
                const: 1986,
              },
              {
                const: 1985,
              },
              {
                const: 1984,
              },
              {
                const: 1983,
              },
              {
                const: 1982,
              },
              {
                const: 1981,
              },
              {
                const: 1980,
              },
              {
                const: 1979,
              },
              {
                const: 1978,
              },
              {
                const: 1977,
              },
              {
                const: 1976,
              },
              {
                const: 1975,
              },
              {
                const: 1974,
              },
              {
                const: 1973,
              },
              {
                const: 1972,
              },
              {
                const: 1971,
              },
              {
                const: 1970,
              },
              {
                const: 1969,
              },
              {
                const: 1968,
              },
              {
                const: 1967,
              },
              {
                const: 1966,
              },
              {
                const: 1965,
              },
              {
                const: 1964,
              },
              {
                const: 1963,
              },
              {
                const: 1962,
              },
              {
                const: 1961,
              },
              {
                const: 1960,
              },
              {
                const: 1959,
              },
              {
                const: 1958,
              },
              {
                const: 1957,
              },
              {
                const: 1956,
              },
              {
                const: 1955,
              },
              {
                const: 1954,
              },
              {
                const: 1953,
              },
              {
                const: 1952,
              },
              {
                const: 1951,
              },
              {
                const: 1950,
              },
              {
                const: 1949,
              },
              {
                const: 1948,
              },
              {
                const: 1947,
              },
              {
                const: 1946,
              },
              {
                const: 1945,
              },
              {
                const: 1944,
              },
              {
                const: 1943,
              },
              {
                const: 1942,
              },
              {
                const: 1941,
              },
              {
                const: 1940,
              },
              {
                const: 1939,
              },
              {
                const: 1938,
              },
              {
                const: 1937,
              },
              {
                const: 1936,
              },
              {
                const: 1935,
              },
              {
                const: 1934,
              },
              {
                const: 1933,
              },
              {
                const: 1932,
              },
              {
                const: 1931,
              },
              {
                const: 1930,
              },
              {
                const: 1929,
              },
              {
                const: 1928,
              },
              {
                const: 1927,
              },
              {
                const: 1926,
              },
              {
                const: 1925,
              },
              {
                const: 1924,
              },
              {
                const: 1923,
              },
              {
                const: 1922,
              },
              {
                const: 1921,
              },
              {
                const: 1920,
              },
              {
                const: 1919,
              },
              {
                const: 1918,
              },
              {
                const: 1917,
              },
              {
                const: 1916,
              },
              {
                const: 1915,
              },
              {
                const: 1914,
              },
              {
                const: 1913,
              },
              {
                const: 1912,
              },
              {
                const: 1911,
              },
              {
                const: 1910,
              },
              {
                const: 1909,
              },
              {
                const: 1908,
              },
              {
                const: 1907,
              },
              {
                const: 1906,
              },
              {
                const: 1905,
              },
              {
                const: 1904,
              },
              {
                const: 1903,
              },
              {
                const: 1902,
              },
              {
                const: 1901,
              },
              {
                const: 1900,
              },
            ],
          },
          domicile: {
            type: 'string',
            oneOf: [
              {
                const: 'cba10e5c-be96-4012-b13e-c52d5cac2410',
                title: 'Port Ivelisse',
              },
              {
                const: '24aae873-a348-42ca-a31d-293df5a02c38',
                title: 'West Luciostad',
              },
              {
                const: '31bfdb56-1d0e-41a7-8d28-79287e746bff',
                title: 'New Juanatown',
              },
              {
                const: '235239a8-0b53-44a2-b939-e5bc00c1a3c0',
                title: 'Port Wilheminaburgh',
              },
              {
                const: '9341a302-6359-4269-bcd9-4b3dc396bf15',
                title: 'New Doyletown',
              },
              {
                const: 'c5f626fb-08e4-49b2-a390-e7e6ef3392e6',
                title: 'Hansenshire',
              },
              {
                const: '80b0de9e-bf6c-4304-8485-03c9e1832cf6',
                title: 'Keelingville',
              },
              {
                const: '6b3a8e10-fdef-425b-ba94-657277e68570',
                title: 'Kautzershire',
              },
              {
                const: '789c8f32-d25f-4f26-89fb-c11a4c1a5d5c',
                title: 'North Ena',
              },
              {
                const: '99f42ce6-a6ea-4c7f-b354-933520afd458',
                title: 'Christiansenfort',
              },
              {
                const: 'a93e2a60-4dae-4793-8fc9-a4cf34c82b82',
                title: 'Berenicestad',
              },
              {
                const: '1065a281-d7ed-447f-ad47-289260df0c4b',
                title: 'South Jessia',
              },
              {
                const: 'fb7cde3b-478d-418f-8eca-2f630ac1df0f',
                title: 'Westbrook',
              },
              {
                const: 'outside',
                title: 'Somewhere else',
              },
            ],
          },
          politician: {
            type: 'string',
            oneOf: [
              {
                const: 'active_politician',
                title: 'Active politician',
              },
              {
                const: 'retired_politician',
                title: 'Retired politician',
              },
              {
                const: 'no',
                title: 'No',
              },
            ],
          },
          date_something: {
            type: 'string',
            format: 'date',
          },
        },
        required: ['date_something'],
      },
      'nl-BE': {
        type: 'object',
        additionalProperties: false,
        properties: {
          gender: {
            type: 'string',
            oneOf: [
              {
                const: 'male',
                title: 'Man',
              },
              {
                const: 'female',
                title: 'Vrouw',
              },
              {
                const: 'unspecified',
                title: 'Onbepaald',
              },
            ],
          },
          birthyear: {
            type: 'number',
            oneOf: [
              {
                const: 2011,
              },
              {
                const: 2010,
              },
              {
                const: 2009,
              },
              {
                const: 2008,
              },
              {
                const: 2007,
              },
              {
                const: 2006,
              },
              {
                const: 2005,
              },
              {
                const: 2004,
              },
              {
                const: 2003,
              },
              {
                const: 2002,
              },
              {
                const: 2001,
              },
              {
                const: 2000,
              },
              {
                const: 1999,
              },
              {
                const: 1998,
              },
              {
                const: 1997,
              },
              {
                const: 1996,
              },
              {
                const: 1995,
              },
              {
                const: 1994,
              },
              {
                const: 1993,
              },
              {
                const: 1992,
              },
              {
                const: 1991,
              },
              {
                const: 1990,
              },
              {
                const: 1989,
              },
              {
                const: 1988,
              },
              {
                const: 1987,
              },
              {
                const: 1986,
              },
              {
                const: 1985,
              },
              {
                const: 1984,
              },
              {
                const: 1983,
              },
              {
                const: 1982,
              },
              {
                const: 1981,
              },
              {
                const: 1980,
              },
              {
                const: 1979,
              },
              {
                const: 1978,
              },
              {
                const: 1977,
              },
              {
                const: 1976,
              },
              {
                const: 1975,
              },
              {
                const: 1974,
              },
              {
                const: 1973,
              },
              {
                const: 1972,
              },
              {
                const: 1971,
              },
              {
                const: 1970,
              },
              {
                const: 1969,
              },
              {
                const: 1968,
              },
              {
                const: 1967,
              },
              {
                const: 1966,
              },
              {
                const: 1965,
              },
              {
                const: 1964,
              },
              {
                const: 1963,
              },
              {
                const: 1962,
              },
              {
                const: 1961,
              },
              {
                const: 1960,
              },
              {
                const: 1959,
              },
              {
                const: 1958,
              },
              {
                const: 1957,
              },
              {
                const: 1956,
              },
              {
                const: 1955,
              },
              {
                const: 1954,
              },
              {
                const: 1953,
              },
              {
                const: 1952,
              },
              {
                const: 1951,
              },
              {
                const: 1950,
              },
              {
                const: 1949,
              },
              {
                const: 1948,
              },
              {
                const: 1947,
              },
              {
                const: 1946,
              },
              {
                const: 1945,
              },
              {
                const: 1944,
              },
              {
                const: 1943,
              },
              {
                const: 1942,
              },
              {
                const: 1941,
              },
              {
                const: 1940,
              },
              {
                const: 1939,
              },
              {
                const: 1938,
              },
              {
                const: 1937,
              },
              {
                const: 1936,
              },
              {
                const: 1935,
              },
              {
                const: 1934,
              },
              {
                const: 1933,
              },
              {
                const: 1932,
              },
              {
                const: 1931,
              },
              {
                const: 1930,
              },
              {
                const: 1929,
              },
              {
                const: 1928,
              },
              {
                const: 1927,
              },
              {
                const: 1926,
              },
              {
                const: 1925,
              },
              {
                const: 1924,
              },
              {
                const: 1923,
              },
              {
                const: 1922,
              },
              {
                const: 1921,
              },
              {
                const: 1920,
              },
              {
                const: 1919,
              },
              {
                const: 1918,
              },
              {
                const: 1917,
              },
              {
                const: 1916,
              },
              {
                const: 1915,
              },
              {
                const: 1914,
              },
              {
                const: 1913,
              },
              {
                const: 1912,
              },
              {
                const: 1911,
              },
              {
                const: 1910,
              },
              {
                const: 1909,
              },
              {
                const: 1908,
              },
              {
                const: 1907,
              },
              {
                const: 1906,
              },
              {
                const: 1905,
              },
              {
                const: 1904,
              },
              {
                const: 1903,
              },
              {
                const: 1902,
              },
              {
                const: 1901,
              },
              {
                const: 1900,
              },
            ],
          },
          domicile: {
            type: 'string',
            oneOf: [
              {
                const: 'cba10e5c-be96-4012-b13e-c52d5cac2410',
                title: 'North Violetteton',
              },
              {
                const: '24aae873-a348-42ca-a31d-293df5a02c38',
                title: 'North Kamilah',
              },
              {
                const: '31bfdb56-1d0e-41a7-8d28-79287e746bff',
                title: 'East Autumnview',
              },
              {
                const: '235239a8-0b53-44a2-b939-e5bc00c1a3c0',
                title: 'Lake Beverleyside',
              },
              {
                const: '9341a302-6359-4269-bcd9-4b3dc396bf15',
                title: 'Barrowsmouth',
              },
              {
                const: 'c5f626fb-08e4-49b2-a390-e7e6ef3392e6',
                title: 'Port Darnellfort',
              },
              {
                const: '80b0de9e-bf6c-4304-8485-03c9e1832cf6',
                title: 'Bartellberg',
              },
              {
                const: '6b3a8e10-fdef-425b-ba94-657277e68570',
                title: 'Hyattview',
              },
              {
                const: '789c8f32-d25f-4f26-89fb-c11a4c1a5d5c',
                title: 'West Lucio',
              },
              {
                const: '99f42ce6-a6ea-4c7f-b354-933520afd458',
                title: 'Tuberg',
              },
              {
                const: 'a93e2a60-4dae-4793-8fc9-a4cf34c82b82',
                title: 'Port Lovettamouth',
              },
              {
                const: '1065a281-d7ed-447f-ad47-289260df0c4b',
                title: 'Wendolynmouth',
              },
              {
                const: 'fb7cde3b-478d-418f-8eca-2f630ac1df0f',
                title: 'Westbrook',
              },
              {
                const: 'outside',
                title: 'Ergens anders',
              },
            ],
          },
          politician: {
            type: 'string',
            oneOf: [
              {
                const: 'active_politician',
                title: 'Active politician',
              },
              {
                const: 'retired_politician',
                title: 'Retired politician',
              },
              {
                const: 'no',
                title: 'No',
              },
            ],
          },
          date_something: {
            type: 'string',
            format: 'date',
          },
        },
        required: ['date_something'],
      },
      'fr-BE': {
        type: 'object',
        additionalProperties: false,
        properties: {
          gender: {
            type: 'string',
            oneOf: [
              {
                const: 'male',
                title: 'Masculin',
              },
              {
                const: 'female',
                title: 'Féminin',
              },
              {
                const: 'unspecified',
                title: 'Autre',
              },
            ],
          },
          birthyear: {
            type: 'number',
            oneOf: [
              {
                const: 2011,
              },
              {
                const: 2010,
              },
              {
                const: 2009,
              },
              {
                const: 2008,
              },
              {
                const: 2007,
              },
              {
                const: 2006,
              },
              {
                const: 2005,
              },
              {
                const: 2004,
              },
              {
                const: 2003,
              },
              {
                const: 2002,
              },
              {
                const: 2001,
              },
              {
                const: 2000,
              },
              {
                const: 1999,
              },
              {
                const: 1998,
              },
              {
                const: 1997,
              },
              {
                const: 1996,
              },
              {
                const: 1995,
              },
              {
                const: 1994,
              },
              {
                const: 1993,
              },
              {
                const: 1992,
              },
              {
                const: 1991,
              },
              {
                const: 1990,
              },
              {
                const: 1989,
              },
              {
                const: 1988,
              },
              {
                const: 1987,
              },
              {
                const: 1986,
              },
              {
                const: 1985,
              },
              {
                const: 1984,
              },
              {
                const: 1983,
              },
              {
                const: 1982,
              },
              {
                const: 1981,
              },
              {
                const: 1980,
              },
              {
                const: 1979,
              },
              {
                const: 1978,
              },
              {
                const: 1977,
              },
              {
                const: 1976,
              },
              {
                const: 1975,
              },
              {
                const: 1974,
              },
              {
                const: 1973,
              },
              {
                const: 1972,
              },
              {
                const: 1971,
              },
              {
                const: 1970,
              },
              {
                const: 1969,
              },
              {
                const: 1968,
              },
              {
                const: 1967,
              },
              {
                const: 1966,
              },
              {
                const: 1965,
              },
              {
                const: 1964,
              },
              {
                const: 1963,
              },
              {
                const: 1962,
              },
              {
                const: 1961,
              },
              {
                const: 1960,
              },
              {
                const: 1959,
              },
              {
                const: 1958,
              },
              {
                const: 1957,
              },
              {
                const: 1956,
              },
              {
                const: 1955,
              },
              {
                const: 1954,
              },
              {
                const: 1953,
              },
              {
                const: 1952,
              },
              {
                const: 1951,
              },
              {
                const: 1950,
              },
              {
                const: 1949,
              },
              {
                const: 1948,
              },
              {
                const: 1947,
              },
              {
                const: 1946,
              },
              {
                const: 1945,
              },
              {
                const: 1944,
              },
              {
                const: 1943,
              },
              {
                const: 1942,
              },
              {
                const: 1941,
              },
              {
                const: 1940,
              },
              {
                const: 1939,
              },
              {
                const: 1938,
              },
              {
                const: 1937,
              },
              {
                const: 1936,
              },
              {
                const: 1935,
              },
              {
                const: 1934,
              },
              {
                const: 1933,
              },
              {
                const: 1932,
              },
              {
                const: 1931,
              },
              {
                const: 1930,
              },
              {
                const: 1929,
              },
              {
                const: 1928,
              },
              {
                const: 1927,
              },
              {
                const: 1926,
              },
              {
                const: 1925,
              },
              {
                const: 1924,
              },
              {
                const: 1923,
              },
              {
                const: 1922,
              },
              {
                const: 1921,
              },
              {
                const: 1920,
              },
              {
                const: 1919,
              },
              {
                const: 1918,
              },
              {
                const: 1917,
              },
              {
                const: 1916,
              },
              {
                const: 1915,
              },
              {
                const: 1914,
              },
              {
                const: 1913,
              },
              {
                const: 1912,
              },
              {
                const: 1911,
              },
              {
                const: 1910,
              },
              {
                const: 1909,
              },
              {
                const: 1908,
              },
              {
                const: 1907,
              },
              {
                const: 1906,
              },
              {
                const: 1905,
              },
              {
                const: 1904,
              },
              {
                const: 1903,
              },
              {
                const: 1902,
              },
              {
                const: 1901,
              },
              {
                const: 1900,
              },
            ],
          },
          domicile: {
            type: 'string',
            oneOf: [
              {
                const: 'cba10e5c-be96-4012-b13e-c52d5cac2410',
                title: 'Port Linh',
              },
              {
                const: '24aae873-a348-42ca-a31d-293df5a02c38',
                title: 'South Newtonton',
              },
              {
                const: '31bfdb56-1d0e-41a7-8d28-79287e746bff',
                title: 'West Ieshabury',
              },
              {
                const: '235239a8-0b53-44a2-b939-e5bc00c1a3c0',
                title: 'McClureville',
              },
              {
                const: '9341a302-6359-4269-bcd9-4b3dc396bf15',
                title: 'New Tiffany',
              },
              {
                const: 'c5f626fb-08e4-49b2-a390-e7e6ef3392e6',
                title: 'Rosenbaummouth',
              },
              {
                const: '80b0de9e-bf6c-4304-8485-03c9e1832cf6',
                title: 'Wayneshire',
              },
              {
                const: '6b3a8e10-fdef-425b-ba94-657277e68570',
                title: 'North Jazmine',
              },
              {
                const: '789c8f32-d25f-4f26-89fb-c11a4c1a5d5c',
                title: 'North Waldobury',
              },
              {
                const: '99f42ce6-a6ea-4c7f-b354-933520afd458',
                title: 'Port Sherrylton',
              },
              {
                const: 'a93e2a60-4dae-4793-8fc9-a4cf34c82b82',
                title: 'Marhtatown',
              },
              {
                const: '1065a281-d7ed-447f-ad47-289260df0c4b',
                title: 'Camelliahaven',
              },
              {
                const: 'fb7cde3b-478d-418f-8eca-2f630ac1df0f',
                title: 'Westbrook',
              },
              {
                const: 'outside',
                title: 'Autre lieu',
              },
            ],
          },
          politician: {
            type: 'string',
            oneOf: [
              {
                const: 'active_politician',
                title: 'Active politician',
              },
              {
                const: 'retired_politician',
                title: 'Retired politician',
              },
              {
                const: 'no',
                title: 'No',
              },
            ],
          },
          date_something: {
            type: 'string',
            format: 'date',
          },
        },
        required: ['date_something'],
      },
    },
    ui_schema_multiloc: {
      en: {
        type: 'VerticalLayout',
        options: {
          formId: 'user-form',
        },
        elements: [
          {
            type: 'Control',
            scope: '#/properties/gender',
            label: 'Gender',
            options: {
              description: '',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/birthyear',
            label: 'Year of birth',
            options: {
              description: '',
              input_type: 'number',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/domicile',
            label: 'Place of residence',
            options: {
              description: '',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/politician',
            label: 'Are you a politician?',
            options: {
              description:
                'We use this to provide you with customized information',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/date_something',
            label: 'Date something',
            options: {
              description:
                'Date somethingDate somethingDate somethingDate somethingDate somethingDate something',
              input_type: 'date',
            },
          },
        ],
      },
      'nl-BE': {
        type: 'VerticalLayout',
        options: {
          formId: 'user-form',
        },
        elements: [
          {
            type: 'Control',
            scope: '#/properties/gender',
            label: 'Geslacht',
            options: {
              description: '',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/birthyear',
            label: 'Geboortejaar',
            options: {
              description: '',
              input_type: 'number',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/domicile',
            label: 'Woonplaats',
            options: {
              description: '',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/politician',
            label: 'Are you a politician?',
            options: {
              description:
                'We use this to provide you with customized information',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/date_something',
            label: 'Date something',
            options: {
              description:
                'Date somethingDate somethingDate somethingDate somethingDate somethingDate something',
              input_type: 'date',
            },
          },
        ],
      },
      'fr-BE': {
        type: 'VerticalLayout',
        options: {
          formId: 'user-form',
        },
        elements: [
          {
            type: 'Control',
            scope: '#/properties/gender',
            label: 'Genre',
            options: {
              description: '',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/birthyear',
            label: 'Année de naissance',
            options: {
              description: '',
              input_type: 'number',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/domicile',
            label: 'Localité',
            options: {
              description: '',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/politician',
            label: 'Are you a politician?',
            options: {
              description:
                'We use this to provide you with customized information',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/date_something',
            label: 'Date something',
            options: {
              description:
                'Date somethingDate somethingDate somethingDate somethingDate somethingDate something',
              input_type: 'date',
            },
          },
        ],
      },
    },
  },
};
