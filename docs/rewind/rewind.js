const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MIX_COLORS = {
  "K-drama": "#e0b0ba",
  Other: "#6f6b70",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const tip = document.getElementById("tip");

function parseYmd(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function prettyDate(iso) {
  const d = parseYmd(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function showTip(event, html) {
  tip.hidden = false;
  tip.innerHTML = html;
  const pad = 14;
  const x = Math.min(event.clientX + pad, window.innerWidth - tip.offsetWidth - 12);
  const y = Math.min(event.clientY + pad, window.innerHeight - tip.offsetHeight - 12);
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
}

function hideTip() {
  tip.hidden = true;
}

function whenSeen(el, run, threshold = 0.2) {
  if (reduceMotion) {
    run();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run();
        io.disconnect();
      });
    },
    { threshold }
  );
  io.observe(el);
}

function heatColor(count, max) {
  if (!count) return "#2c2226";
  const t = count / max;
  return d3.interpolateRgb("#6a4852", "#e0b0ba")(Math.max(0.18, t));
}

function drawHeatmap(el, days, peakKey) {
  const max = d3.max(days, (d) => d.count) || 1;
  const byYear = d3.group(days, (d) => d.date.slice(0, 4));
  const years = [...byYear.keys()].sort();
  const cell = 12;
  const gap = 3;
  const labelW = 42;
  const dowW = 22;
  const monthH = 16;
  const yearGap = 28;
  const weeks = 53;
  const width = labelW + dowW + weeks * (cell + gap);
  let yCursor = 0;
  const yearLayouts = years.map((year) => {
    const rows = byYear.get(year);
    const start = parseYmd(rows[0].date);
    const end = parseYmd(rows[rows.length - 1].date);
    const origin = d3.timeSunday.floor(start);
    const height = monthH + 7 * (cell + gap);
    const layout = {
      year,
      start,
      end,
      origin,
      y: yCursor,
      height,
      lookup: new Map(rows.map((d) => [d.date, d.count])),
    };
    yCursor += height + yearGap;
    return layout;
  });

  const height = yCursor - yearGap + 8;
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  const dow = ["S", "M", "T", "W", "T", "F", "S"];
  let order = 0;

  yearLayouts.forEach((layout) => {
    const g = svg
      .append("g")
      .attr("class", "heat-year")
      .attr("data-year", layout.year)
      .attr("transform", `translate(0,${layout.y})`);

    g.append("text")
      .attr("class", "heat-year-label")
      .attr("x", 0)
      .attr("y", monthH + 18)
      .text(layout.year);

    dow.forEach((label, i) => {
      if (i % 2) return;
      g.append("text")
        .attr("class", "heat-dow")
        .attr("x", labelW + dowW - 6)
        .attr("y", monthH + i * (cell + gap) + cell - 2)
        .attr("text-anchor", "end")
        .text(label);
    });

    const monthsMarked = new Set();
    const cursor = new Date(layout.origin);
    while (cursor <= layout.end) {
      const week = d3.timeSunday.count(layout.origin, cursor);
      const dowIndex = cursor.getDay();
      const key = ymd(cursor);
      const inRange = cursor >= layout.start && cursor <= layout.end;
      const count = inRange ? layout.lookup.get(key) || 0 : 0;
      const x = labelW + dowW + week * (cell + gap);
      const y = monthH + dowIndex * (cell + gap);

      if (inRange && cursor.getDate() <= 7 && !monthsMarked.has(cursor.getMonth())) {
        monthsMarked.add(cursor.getMonth());
        g.append("text")
          .attr("class", "heat-month")
          .attr("x", x)
          .attr("y", 10)
          .text(MONTHS[cursor.getMonth()].slice(0, 3));
      }

      if (inRange) {
        order += 1;
        g.append("rect")
          .attr("class", `heat-cell${key.slice(0, 7) === peakKey ? " is-peak" : ""}`)
          .attr("x", x)
          .attr("y", y)
          .attr("width", cell)
          .attr("height", cell)
          .attr("rx", 2)
          .attr("fill", heatColor(count, max))
          .style("transition-delay", `${order * 1.1}ms`)
          .on("mousemove", (event) => {
            const plays = count === 1 ? "1 play" : `${count} plays`;
            showTip(event, `<strong>${prettyDate(key)}</strong><br>${plays}`);
          })
          .on("mouseleave", hideTip);
      }

      cursor.setDate(cursor.getDate() + 1);
    }
  });

  const legend = document.getElementById("heat-legend");
  const stops = [0, 1, Math.round(max / 2), max];
  legend.innerHTML = `<span>Less</span>${stops
    .map((n) => `<span class="swatch" style="background:${heatColor(n, max)}"></span>`)
    .join("")}<span>More</span>`;

  return () => svg.classed("is-drawn", true);
}

function drawMix(el, genreMonths) {
  const width = el.clientWidth || 920;
  const height = 300;
  const margin = { top: 8, right: 8, bottom: 44, left: 36 };
  const rows = genreMonths.map((row) => {
    const kdrama = row.genres.find((g) => g.name === "K-drama")?.minutes || 0;
    const rest = row.genres.filter((g) => g.name !== "K-drama");
    const other = rest.reduce((sum, g) => sum + g.minutes, 0);
    return {
      key: row.key,
      label: row.label,
      "K-drama": kdrama / 60,
      Other: other / 60,
      rest,
    };
  });
  const stack = d3.stack().keys(["K-drama", "Other"])(rows);
  const x = d3
    .scaleBand()
    .domain(rows.map((d) => d.key))
    .range([margin.left, width - margin.right])
    .paddingInner(0.22)
    .paddingOuter(0.08);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(rows, (d) => d["K-drama"] + d.Other)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${width} ${height}`);

  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(4).tickSize(-(width - margin.left - margin.right)).tickFormat(""))
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("line").attr("stroke", "#3d3236"));

  const bars = svg
    .selectAll("g.mix-layer")
    .data(stack)
    .join("g")
    .attr("class", "mix-layer")
    .attr("fill", (d) => MIX_COLORS[d.key])
    .selectAll("rect")
    .data((d, i) => d.map((row) => Object.assign(row, { layer: i })))
    .join("rect")
    .attr("class", "mix-bar")
    .attr("x", (d) => x(d.data.key))
    .attr("width", x.bandwidth())
    .attr("y", (d) => (reduceMotion ? y(d[1]) : y(d[0])))
    .attr("height", (d) => (reduceMotion ? Math.max(0, y(d[0]) - y(d[1])) : 0));

  const ticks = rows.filter((_, i) => i % 4 === 0);
  const last = rows[rows.length - 1];
  const prev = ticks[ticks.length - 1];
  if (last && prev && rows.indexOf(last) - rows.indexOf(prev) >= 3) ticks.push(last);

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(ticks.map((d) => d.key))
        .tickFormat((key) => rows.find((d) => d.key === key).label.replace(" 20", " ’"))
        .tickSize(0)
        .tickPadding(12)
    )
    .select(".domain")
    .remove();

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(8).tickFormat((d) => `${d}h`))
    .select(".domain")
    .remove();

  svg
    .selectAll("rect.mix-hit")
    .data(rows)
    .join("rect")
    .attr("class", "mix-hit")
    .attr("x", (d) => x(d.key))
    .attr("width", x.bandwidth())
    .attr("y", margin.top)
    .attr("height", height - margin.top - margin.bottom)
    .attr("fill", "transparent")
    .on("mousemove", (event, d) => {
      svg.selectAll(".mix-bar").attr("opacity", (b) => (b.data.key === d.key ? 1 : 0.35));
      const extra = d.rest
        .filter((g) => g.minutes > 0)
        .map((g) => `${g.name}: ${Math.round(g.minutes / 60)}h`)
        .join("<br>");
      showTip(
        event,
        `<strong>${d.label}</strong><br>K-drama: ${Math.round(d["K-drama"])}h<br>Everything else: ${Math.round(d.Other)}h${extra ? `<br>${extra}` : ""}`
      );
    })
    .on("mouseleave", () => {
      svg.selectAll(".mix-bar").attr("opacity", 1);
      hideTip();
    });

  document.getElementById("mix-legend").innerHTML = `
    <span><i style="background:${MIX_COLORS["K-drama"]}"></i>K-drama</span>
    <span><i style="background:${MIX_COLORS.Other}"></i>Everything else</span>
  `;

  return () =>
    bars
      .transition()
      .duration(700)
      .delay((d, i) => (d.layer === 0 ? 0 : 650) + i * 9)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => Math.max(0, y(d[0]) - y(d[1])));
}

function drawShows(el, shows) {
  const rows = [...shows].sort((a, b) => b.minutes - a.minutes);
  const width = el.clientWidth || 920;
  const rowH = 36;
  const margin = { top: 4, right: 48, bottom: 8, left: 200 };
  const height = margin.top + margin.bottom + rows.length * rowH;
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(rows, (d) => d.minutes / 60)])
    .nice()
    .range([margin.left, width - margin.right]);

  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  const g = svg
    .selectAll("g.show")
    .data(rows)
    .join("g")
    .attr("class", "show")
    .attr("transform", (_, i) => `translate(0,${margin.top + i * rowH})`)
    .style("cursor", "default")
    .on("mousemove", (event, d) => {
      const hours = Math.round(d.minutes / 60);
      const eps = d.count === 1 ? "1 episode" : `${d.count} episodes`;
      showTip(event, `<strong>${d.name}</strong><br>${hours}h · ${eps}`);
    })
    .on("mouseleave", hideTip);

  const names = g
    .append("text")
    .attr("class", "show-name")
    .attr("x", margin.left - 12)
    .attr("y", 16)
    .attr("text-anchor", "end")
    .attr("opacity", reduceMotion ? 1 : 0)
    .text((d) => d.name);

  const lines = g
    .append("line")
    .attr("x1", x(0))
    .attr("x2", (d) => (reduceMotion ? x(d.minutes / 60) : x(0)))
    .attr("y1", 12)
    .attr("y2", 12)
    .attr("stroke", "#e0b0ba")
    .attr("stroke-width", 2);

  const dots = g
    .append("circle")
    .attr("cx", (d) => (reduceMotion ? x(d.minutes / 60) : x(0)))
    .attr("cy", 12)
    .attr("r", 5)
    .attr("fill", "#e0b0ba");

  const hours = g
    .append("text")
    .attr("class", "show-hours")
    .attr("x", (d) => x(d.minutes / 60) + 10)
    .attr("y", 16)
    .attr("opacity", reduceMotion ? 1 : 0)
    .text((d) => `${Math.round(d.minutes / 60)}h`);

  return () => {
    const stagger = (d, i) => i * 90;
    names.transition().duration(400).delay(stagger).attr("opacity", 1);
    lines
      .transition()
      .duration(750)
      .delay(stagger)
      .ease(d3.easeCubicOut)
      .attr("x2", (d) => x(d.minutes / 60));
    dots
      .transition()
      .duration(750)
      .delay(stagger)
      .ease(d3.easeCubicOut)
      .attr("cx", (d) => x(d.minutes / 60));
    hours
      .transition()
      .duration(400)
      .delay((d, i) => stagger(d, i) + 550)
      .attr("opacity", 1);
  };
}

function drawWeek(el, weekdays) {
  const width = el.clientWidth || 920;
  const height = 220;
  const margin = { top: 12, right: 8, bottom: 32, left: 8 };
  const x = d3
    .scaleBand()
    .domain(weekdays.map((d) => d.day))
    .range([margin.left, width - margin.right])
    .padding(0.28);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(weekdays, (d) => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);
  const weekend = new Set(["Saturday", "Sunday"]);

  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  const bars = svg
    .selectAll("rect")
    .data(weekdays)
    .join("rect")
    .attr("x", (d) => x(d.day))
    .attr("width", x.bandwidth())
    .attr("y", (d) => (reduceMotion ? y(d.count) : y(0)))
    .attr("height", (d) => (reduceMotion ? y(0) - y(d.count) : 0))
    .attr("rx", 3)
    .attr("fill", (d) => (weekend.has(d.day) ? "#e0b0ba" : "#8a6a72"))
    .style("cursor", "default")
    .on("mousemove", (event, d) => {
      showTip(event, `<strong>${d.day}</strong><br>${d.count} plays`);
    })
    .on("mouseleave", hideTip);

  svg
    .selectAll("text.day")
    .data(weekdays)
    .join("text")
    .attr("class", "axis-label")
    .attr("x", (d) => x(d.day) + x.bandwidth() / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text((d) => d.day.slice(0, 3));

  return () =>
    bars
      .transition()
      .duration(700)
      .delay((d, i) => i * 70)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => y(0) - y(d.count));
}

function initScrolly(section) {
  const steps = [...section.querySelectorAll(".step")];
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        steps.forEach((step) => step.classList.toggle("is-active", step === entry.target));
        section.dataset.active = entry.target.dataset.step;
      });
    },
    { rootMargin: "-68% 0px -24% 0px" }
  );
  steps.forEach((step) => io.observe(step));
}

function initReveals() {
  const blocks = document.querySelectorAll(".essay > p, .essay > h2, .essay > figure, .method");
  blocks.forEach((block) => block.classList.add("reveal"));
  if (reduceMotion) {
    blocks.forEach((block) => block.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
  );
  blocks.forEach((block) => io.observe(block));
}

function initProgress() {
  const bar = document.getElementById("progress");
  let queued = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    queued = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
}

async function main() {
  const data = await fetch("./data.json").then((res) => res.json());

  document.getElementById("dek").textContent =
    `${prettyDate(data.from)} — ${prettyDate(data.to)}. ${data.total.toLocaleString()} plays, about ${data.totalHours.toLocaleString()} hours.`;
  document.getElementById("method").textContent =
    `The file starts with ${data.firstTitle} and ends with ${data.lastTitle}. Data is the viewing-history CSV from my own account, since Netflix does not have an API for it. Charts built with D3.`;

  const yearCount = (year) => (data.years.find((y) => y.year === year) || { count: 0 }).count;
  document.getElementById("n2024").textContent = yearCount(2024);
  document.getElementById("n2026").textContent = yearCount(2026);
  document.getElementById("peak-label").textContent = data.peakMonth.label;
  document.getElementById("peak-count").textContent = data.peakMonth.count;

  const heatIn = drawHeatmap(document.getElementById("heat"), data.days, data.peakMonth.key);
  const mixIn = drawMix(document.getElementById("mix"), data.genreMonths);
  const showsIn = drawShows(document.getElementById("shows"), data.topShows);
  const weekIn = drawWeek(document.getElementById("week"), data.weekdays);

  whenSeen(document.getElementById("heat"), heatIn, 0.1);
  whenSeen(document.getElementById("mix"), mixIn);
  whenSeen(document.getElementById("shows"), showsIn);
  whenSeen(document.getElementById("week"), weekIn);

  initScrolly(document.getElementById("scrolly-heat"));
  initReveals();
  initProgress();
}

main();
