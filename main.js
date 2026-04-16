const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

function expandHome(p) {
  if (!p.startsWith('~')) return p;
  return path.resolve(p.replace('~', os.homedir()));
}

function getVersionAndUserDataPath() {
  const osAndUserDataPaths = {
    win32: {
      stable: '~/AppData/Local/Google/Chrome/User Data',
      canary: '~/AppData/Local/Google/Chrome SxS/User Data',
      dev: '~/AppData/Local/Google/Chrome Dev/User Data',
      beta: '~/AppData/Local/Google/Chrome Beta/User Data',
    },
    linux: {
      stable: '~/.config/google-chrome',
      canary: '~/.config/google-chrome-canary',
      dev: '~/.config/google-chrome-unstable',
      beta: '~/.config/google-chrome-beta',
    },
    darwin: {
      stable: '~/Library/Application Support/Google/Chrome',
      canary: '~/Library/Application Support/Google/Chrome Canary',
      dev: '~/Library/Application Support/Google/Chrome Dev',
      beta: '~/Library/Application Support/Google/Chrome Beta',
    },
  };

  const platform = process.platform;
  const table = osAndUserDataPaths[platform];
  if (!table) throw new Error(`Unsupported platform ${platform}`);

  const available = {};
  for (const [version, userDataPath0] of Object.entries(table)) {
    const userDataPath = expandHome(userDataPath0);
    if (fs.existsSync(userDataPath)) {
      available[version] = userDataPath;
    }
  }
  return available;
}

function setAllIsGlicEligible(obj) {
  let modified = false;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (item && typeof item === 'object') {
        if (setAllIsGlicEligible(item)) modified = true;
      }
    }
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'is_glic_eligible' && v !== true) {
        obj[k] = true;
        modified = true;
      } else if (v && typeof v === 'object') {
        if (setAllIsGlicEligible(v)) modified = true;
      }
    }
  }

  return modified;
}

function getLastVersion(userDataPath) {
  const lastVersionFile = path.join(userDataPath, 'Last Version');
  if (!fs.existsSync(lastVersionFile)) return null;
  return fs.readFileSync(lastVersionFile, 'utf8');
}

function patchLocalState(userDataPath, lastVersion) {
  const localStateFile = path.join(userDataPath, 'Local State');
  if (!fs.existsSync(localStateFile)) {
    console.log('Failed to patch Local State. File not found', localStateFile);
    return;
  }

  let localState;
  try {
    localState = JSON.parse(fs.readFileSync(localStateFile, 'utf8'));
  } catch (e) {
    console.log('Failed to parse Local State JSON:', e.message);
    return;
  }

  let modified = false;

  // 1) recursive is_glic_eligible -> true
  if (setAllIsGlicEligible(localState)) {
    modified = true;
    console.log('Patched is_glic_eligible');
  }

  // 2) variations_country -> "us"
  if (localState.variations_country !== 'us') {
    localState.variations_country = 'us';
    modified = true;
    console.log('Patched variations_country');
  }

  // 3) variations_permanent_consistency_country[0]=lastVersion, [1]="us"
  const vpcc = localState.variations_permanent_consistency_country;
  if (Array.isArray(vpcc) && vpcc.length >= 2) {
    if (vpcc[0] !== lastVersion || vpcc[1] !== 'us') {
      vpcc[0] = lastVersion;
      vpcc[1] = 'us';
      modified = true;
      console.log('Patched variations_permanent_consistency_country');
    }
  }

  if (modified) {
    fs.writeFileSync(localStateFile, JSON.stringify(localState), 'utf8');
    console.log('Succeeded in patching Local State');
  } else {
    console.log('No need to patch Local State');
  }
}

function waitEnter() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Enter to continue...', () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  const versionAndUserDataPath = getVersionAndUserDataPath();
  if (Object.keys(versionAndUserDataPath).length === 0) {
    throw new Error('No available user data path found');
  }

  for (const [version, userDataPath] of Object.entries(versionAndUserDataPath)) {
    const lastVersion = getLastVersion(userDataPath);
    if (lastVersion === null) {
      console.log('Failed to get version. File not found', path.join(userDataPath, 'Last Version'));
      continue;
    }
    console.log('Patching Chrome', version, lastVersion, `"${userDataPath}"`);
    patchLocalState(userDataPath, lastVersion);
  }

  await waitEnter();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
