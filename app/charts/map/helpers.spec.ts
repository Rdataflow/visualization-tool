import { renderHook } from "@testing-library/react-hooks";

import { BBox } from "@/configurator/config-types";

import {
  BASE_VIEW_STATE,
  useViewState,
  ViewStateInitializationProps,
} from "./helpers";

const width = 400;
const height = 200;
const lockedBBox = [
  [6.8965001, 46.3947983],
  [6.8965001, 46.3947983],
] as BBox;
const featuresBBox = [
  [6.4965001, 46.2947983],
  [6.9965001, 46.4947983],
] as BBox;

describe("useViewState", () => {
  it("should properly set defaultViewState", () => {
    const { result, rerender } = renderHook<
      ViewStateInitializationProps,
      ReturnType<typeof useViewState>
    >((props: ViewStateInitializationProps) => useViewState(props), {
      initialProps: {
        width,
        height,
        lockedBBox: undefined,
        featuresBBox: undefined,
      },
    });

    // If featuresBBox was not provided, defaultViewState should equal BASE_VIEW_STATE.
    expect(BASE_VIEW_STATE).toEqual(
      expect.objectContaining(result.current.defaultViewState)
    );

    rerender({ width, height, lockedBBox: undefined, featuresBBox });

    // If featuresBBox was provided afterwards, defaultViewState should be
    // different than BASE_VIEW_state.
    expect(BASE_VIEW_STATE).not.toEqual(
      expect.objectContaining(result.current.defaultViewState)
    );
  });

  it("should properly set viewState", () => {
    const { result } = renderHook<
      ViewStateInitializationProps,
      ReturnType<typeof useViewState>
    >((props: ViewStateInitializationProps) => useViewState(props), {
      initialProps: {
        width,
        height,
        lockedBBox: undefined,
        featuresBBox,
      },
    });

    // If featuresBBox was provided, defaultViewState should not equal BASE_VIEW_STATE.
    expect(BASE_VIEW_STATE).not.toEqual(
      expect.objectContaining(result.current.defaultViewState)
    );

    const { result: resultLocked } = renderHook<
      ViewStateInitializationProps,
      ReturnType<typeof useViewState>
    >((props: ViewStateInitializationProps) => useViewState(props), {
      initialProps: {
        width,
        height,
        lockedBBox,
        featuresBBox,
      },
    });

    // If lockedBBox was provided, viewState should be different than the one
    // based on featuresBBox.
    expect(resultLocked.current.viewState).not.toEqual(
      result.current.viewState
    );
  });
});