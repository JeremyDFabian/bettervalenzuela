import en from './en.json';

export type MessageKey = keyof typeof en;

/** Returns the UI string for `key`, replacing `{name}` placeholders with `vars`. */
export function t(key: MessageKey, vars: Record<string, string | number> = {}): string {
  const message: string = en[key];
  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
