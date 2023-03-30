export const parseMultiline = (value: string | undefined): string[] | undefined => {
  return value?.split(/,|\n/).map((variableString: string) => variableString.trim())
}
