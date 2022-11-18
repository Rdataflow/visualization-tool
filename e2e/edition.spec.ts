import { loadChartInLocalStorage } from "./charts-utils";
import { test } from "./common";
import offentlicheAusgabenChartConfigFixture from "./fixtures/offentliche-ausgaben-chart-config.json";

test("should be possible to edit filters of a hierarchy", async ({
  page,
  screen,
  selectors,
}) => {
  const key = "WtHYbmsehQKo";
  const config = offentlicheAusgabenChartConfigFixture;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();

  (
    await screen.findByText(
      "Edit filters",
      { selector: "button" },
      { timeout: 5_000 }
    )
  ).click();

  const filters = await selectors.edition.filterDrawer().within();

  await (await filters.findByText("Economic affairs")).click();
  await (await filters.findByText("Social protection")).click();
  await (await filters.findByText("Health")).click();
  await (await filters.findByText("Apply filters")).click();

  await selectors.chart.loaded();
  const middlePanel = await selectors.panels.middle();
  await middlePanel.evaluate((panel) => {
    panel.scrollTo(0, 200);
  });
  await middlePanel.screenshot({
    path: `e2e-screenshots/chart-edition-${key}.png`,
  });
});
