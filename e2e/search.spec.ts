import { within } from "@playwright-testing-library/test";

import { test, expect } from "./common";

test("should be possible to open a search URL, and search state should be recovered", async ({
  page,
  screen,
  selectors,
}) => {
  const ctx = { page, screen };

  test.slow();

  page.goto(
    `/en/browse?includeDrafts=true&order=SCORE&search=category&dataSource=Int`
  );

  expect(await selectors.search.searchInput().getAttribute("value")).toEqual(
    "category"
  );

  expect(await selectors.search.draftsCheckbox().getAttribute("checked")).toBe(
    ""
  );
});

test("search results count coherence", async ({ page, screen, selectors }) => {
  test.slow();

  const categories = [
    "Administration",
    "Agriculture, forestry",
    "Finances",
    "Territory and environment",
  ];

  const themes = [
    "Federal Office for the Environment FOEN",
    "Swiss Federal Archives SFA",
    "Swiss Federal Office of Energy SFOE",
  ];

  for (let t of [...categories, ...themes]) {
    await page.goto("/en/browse?dataSource=Int");
    await selectors.search.resultsCount();

    const panelLeft = await selectors.panels.left();
    await within(panelLeft).findByText(t, undefined, { timeout: 5000 });

    const countChip = await panelLeft.locator(`:text("${t}") + *`);

    const count = await countChip.textContent();
    await panelLeft.locator(`:text("${t}")`).click();

    await page.locator(`:text("${count} results")`).waitFor({ timeout: 10000 });
  }
});