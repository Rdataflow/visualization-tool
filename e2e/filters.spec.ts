import { describe, test, expect } from "./common";

describe("Filters", () => {
  test("Filters initial state should have hierarchy dimensions first and topmost value selected", async ({
    page,
    selectors,
  }) => {
    await page.goto(
      `/en/create/new?cube=https://environment.ld.admin.ch/foen/nfi/49-19-44/cube/1&dataSource=Int`
    );
    await selectors.chart.loaded();

    const filters = selectors.edition.controlSection("Filters");

    await filters.locator("label").first().waitFor({ timeout: 30_000 });

    const labels = filters.locator("label");

    const texts = await labels.allTextContents();
    expect(texts).toEqual([
      // --- Hierarchy dimensions
      "1. Production region",
      "2. Stand structure",
      // ---
      "3. Evaluation type",
      "4. Reference area",
      "5. Grid",
    ]);

    const productionRegionFilter = selectors.edition.dataFilterInput(
      "1. Production region"
    );
    const productionRegionFilterValue = await productionRegionFilter
      .locator("input")
      .inputValue();
    expect(productionRegionFilterValue).toEqual(
      "https://environment.ld.admin.ch/foen/nfi/UnitOfReference/Prodreg/Switzerland"
    );

    const standStructureFilter =
      selectors.edition.dataFilterInput("2. Stand structure");
    const standStructureFilterValue = await standStructureFilter
      .locator("input")
      .inputValue();

    // Following expect is broken
    // https://github.com/visualize-admin/visualization-tool/issues/875
    // TODO reactivate when issue is fixed
    // expect(standStructureFilterValue).toEqual(
    //   "https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Struk/Total"
    // );
  });

  test("Temporal filter should display all values", async ({
    page,
    actions,
    selectors,
    within,
  }) => {
    test.slow();

    await page.goto(
      "/en/create/new?cube=https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/5&dataSource=Prod"
    );
    await selectors.chart.loaded();

    await actions.editor.changeChartType("Map");

    const filters = await selectors.edition.configFilters();

    await filters.locator("label").first().waitFor({ timeout: 30_000 });

    const labels = filters.locator("label");

    const texts = await labels.allTextContents();
    expect(texts).toEqual(["1. Jahr der Vergütung"]);

    const yearFilter = await within(filters).findByText("2014");
    await yearFilter.click();

    const options = await selectors.mui.options().allInnerTexts();

    expect(options.length).toEqual(8);
  });
});
