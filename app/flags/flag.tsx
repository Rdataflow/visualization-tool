import qs from "qs";

import { isRunningInBrowser } from "@/utils/is-running-in-browser";

import FlagStore, { FlagName, FlagValue } from "./store";

const FLAG_PREFIX = "flag__";

const store = new FlagStore();

/**
 * Public API to use flags
 */
const flag = function flag(...args: [FlagName] | [FlagName, FlagValue]) {
  if (args.length === 1) {
    return store.get(args[0]);
  } else {
    const [name, value] = args;
    store.set(name, value);
    return value;
  }
};

/** List all flags from the store */
export const listFlags = () => {
  return store.keys().sort();
};

/** Resets all the flags */
export const resetFlags = () => {
  listFlags().forEach((name) => store.remove(name));
};

/**
 * Enables several flags
 *
 * Supports passing either  object flagName -> flagValue
 *
 * @param {Record<string, boolean>} flagsToEnable
 */
export const enable = (flagsToEnable: FlagName[]) => {
  const flagNameToValue = Object.entries(flagsToEnable);

  if (!flagNameToValue) {
    return;
  }

  flagNameToValue.forEach(([flagName, flagValue]) => {
    flag(flagName as FlagName, flagValue);
  });
};

flag.store = store;
flag.list = listFlags;
flag.reset = resetFlags;
flag.enable = enable;

const initFromSearchParams = (locationSearch: string) => {
  locationSearch = locationSearch.startsWith("?")
    ? locationSearch.substr(1)
    : locationSearch;
  const params = qs.parse(locationSearch);
  for (const [param, value] of Object.entries(params)) {
    if (param.startsWith(FLAG_PREFIX) && typeof value === "string") {
      try {
        flag(param.substr(FLAG_PREFIX.length), JSON.parse(value));
      } catch (e) {
        console.error(e);
      }
    }
  }
};

if (isRunningInBrowser()) {
  // @ts-ignore
  window.flag = flag;
  initFromSearchParams(window.location.search);
}

export { flag };