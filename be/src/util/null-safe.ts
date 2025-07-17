function string(alleged: string | unknown, fallback = ""): string {
  return (alleged as string) ?? fallback;
}

function object<T>(alleged: T | unknown, fallback: T = {} as T): T {
  return (alleged as T) ?? fallback;
}

function number(alleged: number | unknown, fallback = 0): number {
  return (alleged as number) ?? fallback;
}

export const nullSafe = {
  string,
  object,
  number,
};
