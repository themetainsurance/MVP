import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const homePage = readFileSync(join(repositoryRoot, "app", "page.tsx"), "utf8");
const travelPage = readFileSync(
  join(repositoryRoot, "app", "travel", "page.tsx"),
  "utf8"
);

test("home travel quick start submits three real fields to /travel", () => {
  assert.match(homePage, /<form\s+action="\/travel"\s+method="get"/);
  assert.match(homePage, /name="destination"/);
  assert.match(homePage, /name="departureDate"/);
  assert.match(homePage, /name="returnDate"/);
  assert.match(homePage, /<button\s+type="submit"/);
  assert.match(homePage, /<input[\s\S]*name=\{name\}/);
});

test("travel page prefills only the existing destination and date fields", () => {
  assert.match(travelPage, /params\.get\("destination"\)/);
  assert.match(travelPage, /readQuickStartDate\(params, "departureDate"\)/);
  assert.match(travelPage, /readQuickStartDate\(params, "returnDate"\)/);
  assert.match(travelPage, /ISO_DATE_PATTERN\.test\(value\)/);
  assert.match(travelPage, /date\.toISOString\(\)\.slice\(0, 10\) === value/);
  assert.match(travelPage, /\[\\u0000-\\u001f\\u007f\]/);
  assert.match(travelPage, /\.slice\(0, QUICK_START_DESTINATION_MAX_LENGTH\)/);
  assert.match(travelPage, /\.\.\.\(destination \? \{ destination \} : \{\}\)/);
  assert.match(travelPage, /\.\.\.\(departureDate \? \{ departureDate \} : \{\}\)/);
  assert.match(travelPage, /\.\.\.\(returnDate \? \{ returnDate \} : \{\}\)/);
});
