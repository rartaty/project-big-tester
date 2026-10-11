"use strict";

(() => {
  const model = globalThis.DemoModel;
  const get = id => document.getElementById(id);
  const number = new Intl.NumberFormat("ja-JP");
  const summary = model.summarize();
  get("total").textContent = number.format(summary.total);
  get("record-count").textContent = summary.count;
  get("group-count").textContent = summary.groups;

  function cell(text, className = "") {
    const element = document.createElement("td");
    element.textContent = text;
    element.className = className;
    return element;
  }

  function renderRecords() {
    const records = model.selectRecords({
      query: get("search").value,
      group: get("group").value,
      sort: get("sort").value,
    });
    const rows = records.map(record => {
      const row = document.createElement("tr");
      const group = document.createElement("td");
      const tag = document.createElement("span");
      tag.className = "group-tag";
      tag.textContent = `グループ ${record.group}`;
      group.append(tag);
      row.append(cell(record.name), group, cell(number.format(record.value), "numeric"));
      return row;
    });
    get("records").replaceChildren(...rows);
    get("empty").hidden = records.length > 0;
    get("result-count").textContent = `${summary.count} 件中 ${records.length} 件を表示`;
  }

  const low = Math.min(...model.series);
  const high = Math.max(...model.series);
  const points = model.series.map((value, index) => ({
    x: 24 + index * (752 / (model.series.length - 1)),
    y: 160 - ((value - low) / (high - low || 1)) * 130,
  }));
  get("series-line").setAttribute("points", points.map(point => `${point.x},${point.y}`).join(" "));
  for (const point of points) {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", point.x);
    dot.setAttribute("cy", point.y);
    dot.setAttribute("r", "4");
    dot.setAttribute("class", "series-dot");
    get("series-points").append(dot);
  }
  model.series.forEach((value, index) => {
    const row = document.createElement("tr");
    row.append(cell(`サンプル ${index + 1}`), cell(number.format(value), "numeric"));
    get("series-table").append(row);
  });

  get("search").addEventListener("input", renderRecords);
  get("group").addEventListener("change", renderRecords);
  get("sort").addEventListener("change", renderRecords);
  get("reset").addEventListener("click", () => {
    get("search").value = "";
    get("group").value = "all";
    get("sort").value = "name";
    renderRecords();
    get("search").focus();
  });
  renderRecords();
})();
