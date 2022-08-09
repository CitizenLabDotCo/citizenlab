interface Props {
  config: any
}

interface Config<T> {
  data: T[] | null;
  mapping: Mapping<T>;
  innerRadius: number;
}

// https://stackoverflow.com/a/49752227
type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V? P: never]: any
}

type Mapping<T> = {
  theta: KeyOfType<T, number>,
};

type Row = { a: number, b: number, c: string }

const data: Row[] = [
  { a: 1, b: 2, c: 'string1' },
  { a: 3, b: 4, c: 'string2' }
]

const colors = ['blue', 'lightBlue']

const config: Config<Row> = {
  data,
  mapping: {
    theta: 'a'
  },
  innerRadius: 100
}

const Test = (_: Props) => {
  return <></>;
}

const Parent = () => (

  <Test
    config={config}
  />
)