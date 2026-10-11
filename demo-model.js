"use strict";

// All values are fictional and authored specifically for this standalone demo.
(() => {
  const records = Object.freeze([
    Object.freeze({ name: "Asset A", group: "A", value: 320 }),
    Object.freeze({ name: "Asset B", group: "B", value: 240 }),
    Object.freeze({ name: "Asset C", group: "A", value: 280 }),
    Object.freeze({ name: "Asset D", group: "B", value: 160 }),
  ]);
  const series = Object.freeze([720, 760, 730, 840, 820, 900, 960, 1000]);

  function summarize() {
    return {
      total: records.reduce((sum, record) => sum + record.value, 0),
      count: records.length,
      groups: new Set(records.map(record => record.group)).size,
    };
  }

  function selectRecords({ query = "", group = "all", sort = "name" } = {}) {
    const term = query.trim().toLowerCase();
    const selected = records.filter(record =>
      record.name.toLowerCase().includes(term) &&
      (group === "all" || record.group === group)
    );
    const byName = (a, b) => a.name.localeCompare(b.name, "en");
    if (sort === "value-desc") return selected.sort((a, b) => b.value - a.value || byName(a, b));
    if (sort === "value-asc") return selected.sort((a, b) => a.value - b.value || byName(a, b));
    return selected.sort(byName);
  }

  globalThis.DemoModel = Object.freeze({ records, series, summarize, selectRecords });
})();
