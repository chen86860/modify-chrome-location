# Modify Chrome Location to US

> 中文说明请见 [README.zh-CN.md](README.zh-CN.md)

A Node.js script that patches Chrome's `Local State` file to set the region to **United States**, enabling [Gemini](https://gemini.google.com/) in Chrome (Google's built-in AI assistant, also known as "Glic").

---

## Background

Gemini in Chrome (the side panel AI assistant) is currently only available in the United States. Chrome determines eligibility by reading region fields from the `Local State` profile file. This script forcibly sets those fields to `"us"` and marks all accounts as `is_glic_eligible: true`, making Chrome think it is running in a US region.

---

## What It Does

The script modifies three fields inside `Local State`:

| Field                                      | Before            | After             |
| ------------------------------------------ | ----------------- | ----------------- |
| `is_glic_eligible` (all occurrences)       | `false` / missing | `true`            |
| `variations_country`                       | `"cn"` or other   | `"us"`            |
| `variations_permanent_consistency_country` | `[version, "cn"]` | `[version, "us"]` |

---

## Supported Platforms

| Platform | Chrome Channels                      |
| -------- | ------------------------------------ |
| macOS    | Stable, Canary, Dev, Beta            |
| Windows  | Stable, Canary, Dev, Beta            |
| Linux    | Stable, Canary (Unstable), Dev, Beta |

The script automatically detects which channels are installed and patches all of them.

---

## Requirements

- [Node.js](https://nodejs.org/) v14 or later

No external dependencies required.

---

## Prerequisites

Before running the script, complete the following setup steps to ensure Gemini activates correctly.

### Step 1 — Update Chrome

Go to `chrome://settings/help` and update Chrome to the latest version (**v147+ recommended**). After updating, **fully restart** Chrome.

### Step 2 — Set Language to English (United States)

Go to `chrome://settings/languages` and move **English (United States)** to the top of the language list, then restart Chrome.

> This is the most critical step for unlocking Gemini — make sure it is set as the primary language.

After restarting, navigate to `chrome://skills/browse` to verify the Skills page loads. If it opens successfully, no further steps are needed. If not, continue to Step 3.

### Step 3 — Enable Experimental Flags

Go to `chrome://flags` and search for `Glic`. Set all of the following options to **Enabled**:

| Flag                     | State   |
| ------------------------ | ------- |
| Glic                     | Enabled |
| Glic side panel          | Enabled |
| Glic actor               | Enabled |
| Enables Skills in Gemini | Enabled |

Click **Relaunch** at the bottom of the page to restart Chrome and apply the changes.

---

## Usage

### Step 1 — Quit Chrome

> **Important:** Chrome overwrites `Local State` on exit. You must fully quit Chrome before running this script, otherwise your changes will be lost.

- **macOS / Linux:** `Cmd+Q` or `Quit Google Chrome` from the menu
- **Windows:** Right-click the tray icon → `Exit`

### Step 2 — Run the Script

```bash
node main.js
```

The script will print which fields were patched and wait for you to press **Enter** before exiting.

**Example output:**

```
Patching Chrome stable 130.0.6723.117 "/Users/jack/Library/Application Support/Google/Chrome"
Patched is_glic_eligible
Patched variations_country
Patched variations_permanent_consistency_country
Succeeded in patching Local State
Enter to continue...
```

### Step 3 — Relaunch Chrome

Open Chrome after the script completes. Gemini should now appear in the side panel (the ✨ button on the toolbar).

---

## Re-running

Chrome may reset the region fields on updates or profile sign-in. If Gemini disappears, quit Chrome and run the script again.

---

## How It Works

```
Chrome User Data Directory
└── Local State          ← JSON file storing browser-level preferences
    ├── variations_country                       → set to "us"
    ├── variations_permanent_consistency_country → set to [chromeVersion, "us"]
    └── ...accounts[].is_glic_eligible           → set to true (recursive)
```

1. Detects the current OS and locates all Chrome User Data directories.
2. Reads `Last Version` to get the installed Chrome version string.
3. Parses `Local State` as JSON.
4. Recursively sets all `is_glic_eligible` values to `true`.
5. Sets `variations_country` and `variations_permanent_consistency_country` to US values.
6. Writes the modified JSON back to `Local State`.

---

## Disclaimer

This script modifies local browser profile files only. It does not communicate with any server or install any software. Use at your own risk.
