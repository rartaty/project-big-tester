"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, "../demo-model.js"), "utf8"), context);
const model = context.DemoModel;
const names = records => Array.from(records, record => record.name);

test("summary describes the complete sample dataset", () => {
  const summary = model.summarize();
  assert.equal(summary.total, 1000);
  assert.equal(summary.count, 4);
  assert.equal(summary.groups, 2);
});

test("search ignores casing and surrounding spaces", () => {
  assert.deepEqual(names(model.selectRecords({ query: "  aSSeT c  " })), ["Asset C"]);
});

test("search and group selection apply together", () => {
  assert.deepEqual(names(model.selectRecords({ query: "asset", group: "B" })), ["Asset B", "Asset D"]);
  assert.equal(model.selectRecords({ query: "Asset C", group: "B" }).length, 0);
});

test("sorting is numeric in both directions", () => {
  assert.deepEqual(names(model.selectRecords({ sort: "value-desc" })), ["Asset A", "Asset C", "Asset B", "Asset D"]);
  assert.deepEqual(names(model.selectRecords({ sort: "value-asc" })), ["Asset D", "Asset B", "Asset C", "Asset A"]);
});

test("empty and unmatched searches are handled without changing the dataset", () => {
  assert.equal(model.selectRecords({ query: "   " }).length, 4);
  assert.equal(model.selectRecords({ query: "does-not-exist" }).length, 0);
  assert.equal(model.selectRecords({ query: "<script>" }).length, 0);
});

test("filter results cannot mutate shared sample records", () => {
  const result = model.selectRecords({ sort: "value-asc" });
  result.pop();
  assert.throws(() => { result[0].value = 999; }, TypeError);
  assert.deepEqual(names(model.selectRecords()), ["Asset A", "Asset B", "Asset C", "Asset D"]);
  assert.equal(model.summarize().total, 1000);
});
