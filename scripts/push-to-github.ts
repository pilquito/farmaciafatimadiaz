// GitHub integration - push project to repository
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', '.cache', '.local', '.config',
  '.upm', '__pycache__', '.replit', 'attached_assets', 'snippets'
]);

const IGNORED_FILES = new Set([
  '.replit', 'replit.nix', '.replit.nix', 'replit_zip_error_log.txt'
]);

function getAllFiles(dirPath: string, basePath: string = dirPath): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
        files.push(...getAllFiles(fullPath, basePath));
      }
    } else {
      if (!IGNORED_FILES.has(entry.name) && !entry.name.startsWith('.')) {
        const stat = fs.statSync(fullPath);
        if (stat.size < 50 * 1024 * 1024) {
          files.push(relativePath);
        }
      }
    }
  }
  return files;
}

function isTextFile(filePath: string): boolean {
  const textExtensions = new Set([
    '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html', '.md',
    '.txt', '.yml', '.yaml', '.toml', '.env', '.sql', '.sh',
    '.svg', '.xml', '.lock', '.gitignore', '.npmrc', '.eslintrc',
    '.prettierrc', '.editorconfig'
  ]);
  const ext = path.extname(filePath).toLowerCase();
  if (textExtensions.has(ext)) return true;
  const basename = path.basename(filePath).toLowerCase();
  if (['makefile', 'dockerfile', 'procfile', 'license', 'readme'].includes(basename)) return true;
  return false;
}

async function main() {
  console.log('Obteniendo token de GitHub...');
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Conectado como: ${user.login}`);

  const repoName = 'farmaciafatimadiaz';
  const owner = user.login;

  // Check if repo exists
  try {
    await octokit.repos.get({ owner, repo: repoName });
    console.log(`Repositorio ${repoName} ya existe.`);
  } catch (e: any) {
    if (e.status === 404) {
      console.log(`Creando repositorio ${repoName}...`);
      await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'Farmacia Fátima Díaz Guillén & Centro Médico Clodina - Web Application',
        private: true,
        auto_init: false
      });
      console.log('Repositorio creado.');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      throw e;
    }
  }

  // Check if repo has any commits, if not initialize it
  let hasCommits = false;
  try {
    await octokit.git.getRef({ owner, repo: repoName, ref: 'heads/main' });
    hasCommits = true;
  } catch {
    console.log('Repositorio sin commits. Inicializando con README...');
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: 'README.md',
      message: 'Initial commit',
      content: Buffer.from('# Farmacia Fátima Díaz Guillén\n\nWeb Application for Farmacia Fátima Díaz Guillén & Centro Médico Clodina\n').toString('base64')
    });
    console.log('README creado. Esperando...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  const projectDir = '/home/runner/workspace';
  console.log('Recopilando archivos del proyecto...');
  const files = getAllFiles(projectDir);
  console.log(`Encontrados ${files.length} archivos para subir.`);

  const blobs: { path: string; sha: string; mode: string; type: string }[] = [];
  let uploaded = 0;

  for (const file of files) {
    const fullPath = path.join(projectDir, file);
    try {
      let content: string;
      let encoding: 'utf-8' | 'base64';

      if (isTextFile(file)) {
        content = fs.readFileSync(fullPath, 'utf-8');
        encoding = 'utf-8';
      } else {
        content = fs.readFileSync(fullPath).toString('base64');
        encoding = 'base64';
      }

      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo: repoName,
        content,
        encoding
      });

      blobs.push({
        path: file,
        sha: blob.sha,
        mode: '100644',
        type: 'blob'
      });

      uploaded++;
      if (uploaded % 20 === 0) {
        console.log(`  Subidos ${uploaded}/${files.length} archivos...`);
      }
    } catch (err: any) {
      console.error(`  Error subiendo ${file}: ${err.message}`);
    }
  }

  console.log(`Todos los blobs creados (${blobs.length}). Creando árbol...`);

  const batchSize = 100;
  let currentTreeSha: string | undefined;

  for (let i = 0; i < blobs.length; i += batchSize) {
    const batch = blobs.slice(i, i + batchSize);
    const treeParams: any = {
      owner,
      repo: repoName,
      tree: batch
    };
    if (currentTreeSha) {
      treeParams.base_tree = currentTreeSha;
    }
    const { data: tree } = await octokit.git.createTree(treeParams);
    currentTreeSha = tree.sha;
    console.log(`  Árbol batch ${Math.floor(i / batchSize) + 1} creado.`);
  }

  console.log('Creando commit...');
  const commitParams: any = {
    owner,
    repo: repoName,
    message: 'Initial commit - Farmacia Fátima Díaz Guillén',
    tree: currentTreeSha!
  };

  try {
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo: repoName,
      ref: 'heads/main'
    });
    commitParams.parents = [ref.object.sha];
  } catch {
    // no existing commits
  }

  const { data: commit } = await octokit.git.createCommit(commitParams);
  console.log(`Commit creado: ${commit.sha}`);

  try {
    await octokit.git.updateRef({
      owner,
      repo: repoName,
      ref: 'heads/main',
      sha: commit.sha,
      force: true
    });
    console.log('Referencia main actualizada.');
  } catch {
    await octokit.git.createRef({
      owner,
      repo: repoName,
      ref: 'refs/heads/main',
      sha: commit.sha
    });
    console.log('Referencia main creada.');
  }

  console.log(`\n¡Completado! Repositorio disponible en: https://github.com/${owner}/${repoName}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
