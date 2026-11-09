// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guides for ready-made stacks: static sites, WordPress, Shopify, WooCommerce, Medusa and Saleor.
(function (Kit) {
  var ready = Kit.ready = {};
  var TERMINAL = 'Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL.';
  var NODE_NOTE = 'Recent npm versions may warn that a package\'s install script wasn\'t approved. You can usually ignore that.';

  var POST = "---\ntitle: Hello world\ndate: 2026-01-15\n---\n\nThis is my **first post**. Write in Markdown, and the build turns it into a page.\n";
  var POST_LINES = [['--- lines', 'Front matter: details about the page, kept apart from its text.'], ['title and date', 'Your page templates read these.'], ['**first post**', 'Markdown for bold text.']];

  // Decap gives non-technical editors a form that commits to Git.
  function decapItems(a, adminDir, folder, mediaFolder, publicFolder) {
    return [
      { p: 'Decap CMS gives editors a web form at <code>/admin</code>. It saves their work as Markdown commits in your repository, so there\'s no database to run.' },
      { file: adminDir + '/index.html', lang: 'html', code: "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"robots\" content=\"noindex\" />\n    <title>Content Manager</title>\n  </head>\n  <body>\n    <script src=\"https://cdn.jsdelivr.net/npm/decap-cms@^3.0.0/dist/decap-cms.js\"></script>\n  </body>\n</html>\n", lines: [['decap-cms.js', 'The whole editor, loaded from a CDN.'], ['noindex', 'Keeps search engines away from the editor.']] },
      { file: adminDir + '/config.yml', lang: 'yaml', code: "backend:\n  name: github\n  repo: your-name/your-repo\n  branch: main\n\nmedia_folder: \"" + mediaFolder + "\"\npublic_folder: \"" + publicFolder + "\"\n\ncollections:\n  - name: posts\n    label: Posts\n    folder: " + folder + "\n    create: true\n    fields:\n      - { label: \"Title\", name: \"title\", widget: \"string\" }\n      - { label: \"Date\", name: \"date\", widget: \"datetime\" }\n      - { label: \"Body\", name: \"body\", widget: \"markdown\" }\n", lines: [['backend', 'Where content is saved. Replace <code>repo</code> with your own.'], ['media_folder', 'Where uploaded images are stored in the repository.'], ['public_folder', 'The address of those images on the site.'], ['collections', 'The kinds of content editors can create. Each field becomes a form input.']] },
      { warn: 'Editors need to log in through GitHub, which needs an OAuth app and a small proxy. Follow Decap\'s <a href="https://decapcms.org/docs/github-backend/">GitHub backend docs</a>. I didn\'t run the editor, because that needs your repository and OAuth app.' }
    ];
  }
  var CONTENTFUL_INTRO = 'A hosted CMS stores your content, and your site fetches it when it builds. This guide uses <a href="https://www.contentful.com/developers/docs/references/content-delivery-api/">Contentful</a>, and other services work the same way. Create a free space, then a content type called <code>post</code> with <code>title</code>, <code>date</code> and <code>body</code> fields. Copy the space ID and the Content Delivery API key.';
  var CONTENTFUL_ENV = 'export CONTENTFUL_SPACE=your-space-id\nexport CONTENTFUL_TOKEN=your-delivery-api-key';
  var CONTENTFUL_NOTE = 'I didn\'t run this, because it needs a Contentful account. Publishing an entry doesn\'t change your site by itself, so add a webhook in Contentful that starts a new build at your host.';

  function hostItems(a, out, build, gh) {
    if (a.contentHost === 'cloudflare') return [
      { p: 'Cloudflare\'s current advice for new projects is Workers, which serves your finished files worldwide.' },
      { cmd: 'npm install -D wrangler@latest', noRunUnlessNode: true, lines: [['wrangler', 'Cloudflare\'s command-line tool.']] },
      { file: 'wrangler.jsonc', lang: 'json', code: '{\n  "name": "my-site",\n  "compatibility_date": "2026-11-01",\n  "assets": {\n    "directory": "./' + out + '",\n    "not_found_handling": "404-page"\n  }\n}\n', lines: [['name', 'Your site\'s name at Cloudflare.'], ['compatibility_date', 'Which version of Cloudflare\'s behavior to use. Set it to the day you deploy.'], ['assets.directory', 'The folder of finished files.'], ['not_found_handling', 'Serves your <code>404.html</code> for missing pages.']] },
      { cmd: build + ' && npx wrangler deploy', manual: true, lines: [['wrangler deploy', 'Uploads the files. It asks you to log in the first time, and prints your site\'s address.']] },
      { p: 'To deploy on every push, connect your repository under <strong>Compute</strong>, <strong>Workers &amp; Pages</strong> in the Cloudflare dashboard. I didn\'t run the deployment, because it needs an account.' }
    ];
    if (a.contentHost === 'netlify') return [
      { file: 'netlify.toml', lang: 'text', code: '[build]\n  command = "' + build + '"\n  publish = "' + out + '"\n', lines: [['command', 'How Netlify builds your site.'], ['publish', 'The folder of finished files.']] },
      { p: 'Push your code, then in the <a href="https://docs.netlify.com/">Netlify dashboard</a> choose <strong>Add a new site</strong> and import the repository. It deploys on every push. I didn\'t run the deployment, because it needs an account.' }
    ];
    if (a.contentHost === 'github-pages') return [{ p: 'In your repository\'s <strong>Settings</strong>, <strong>Pages</strong>, set <strong>Source</strong> to <strong>GitHub Actions</strong>. Then add this workflow, which builds and publishes on every push to <code>main</code>:' }, gh, { p: 'I didn\'t run the deployment, because it needs your repository.' }];
    return [
      { p: 'Rent a Linux server, point your domain at it, and install <a href="https://caddyserver.com/docs/install">Caddy</a>, which gets HTTPS certificates automatically.' },
      { file: '/etc/caddy/Caddyfile', lang: 'text', manual: true, code: 'example.com {\n  root * /var/www/site\n  file_server\n}\n', lines: [['example.com', 'Your domain.'], ['root', 'The folder of files to serve.'], ['file_server', 'Serves them as they are.']] },
      { cmd: build + '\nrsync -avz --delete ' + out + '/ you@example.com:/var/www/site/', manual: true, lines: [['rsync', 'Copies only what changed to your server.'], ['--delete', 'Removes files on the server that no longer exist in your build.']] },
      { p: 'You\'re now responsible for operating system updates and a firewall that only allows ports 22, 80 and 443. I didn\'t run this, because it needs a server.' }
    ];
  }

  ready.astro = function (a) {
    var s = [];
    var headless = a.contentSource === 'headless';
    s.push({ id: 'tools', title: 'Install your tools', items: [{ p: 'You need <a href="https://nodejs.org/en/download">Node.js</a> 22.23.4 or newer, and not an odd-numbered version such as 23. ' + TERMINAL + ' ' + NODE_NOTE }, { cmd: 'node --version', lines: [['node', 'Astro runs on Node while it builds. Your finished site doesn\'t need it.']] }] });
    s.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'npm create astro@latest demo -- --template minimal --no-install --no-git --skip-houston --yes\ncd demo\nnpm install', lines: [['npm create astro@latest', 'Downloads and runs Astro\'s project creator.'], ['--template minimal', 'Starts from an almost empty site, so you see every file.'], ['--no-install and --no-git', 'Skips those two steps, because the guide does the install itself.'], ['--skip-houston', 'Skips the animated welcome.']] }
    ] });
    var content = [];
    if (headless) {
      content.push({ p: CONTENTFUL_INTRO }, { cmd: CONTENTFUL_ENV, manual: true, lines: [['CONTENTFUL_TOKEN', 'Reads published content. Keep it out of Git anyway.']] });
      content.push({ file: 'src/lib/posts.ts', lang: 'typescript', code: "const url = `https://cdn.contentful.com/spaces/${import.meta.env.CONTENTFUL_SPACE}/environments/master/entries?content_type=post&access_token=${import.meta.env.CONTENTFUL_TOKEN}`;\n\nexport async function getPosts() {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error('Contentful error ' + res.status);\n  const data = await res.json();\n  return data.items.map((item: { sys: { id: string }; fields: { title: string; date: string; body: string } }) => ({ id: item.sys.id, ...item.fields }));\n}\n", lines: [['cdn.contentful.com', 'Contentful\'s read-only API, which returns published entries.'], ['import.meta.env', 'How Astro reads environment variables during the build.'], ['item.fields', 'The values you typed into Contentful.']] });
      content.push({ file: 'src/pages/index.astro', lang: 'html', code: "---\nimport { getPosts } from '../lib/posts';\nconst posts = await getPosts();\n---\n\n<html lang=\"en\">\n  <head><meta charset=\"utf-8\" /><title>My site</title></head>\n  <body>\n    <h1>My site</h1>\n    <ul>\n      {posts.map((post) => <li><a href={`/posts/${post.id}/`}>{post.title}</a></li>)}\n    </ul>\n  </body>\n</html>\n", lines: [['--- block', 'Code that runs during the build. Nothing here reaches the browser.'], ['{posts.map(...)}', 'Turns each post into a list item.']] });
      content.push({ file: 'src/pages/posts/[id].astro', lang: 'html', code: "---\nimport { getPosts } from '../../lib/posts';\n\nexport async function getStaticPaths() {\n  const posts = await getPosts();\n  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));\n}\n\nconst { post } = Astro.props;\n---\n\n<html lang=\"en\">\n  <head><meta charset=\"utf-8\" /><title>{post.title}</title></head>\n  <body>\n    <h1>{post.title}</h1>\n    <p>{post.body}</p>\n  </body>\n</html>\n", lines: [['[id]', 'The brackets make one page per value.'], ['getStaticPaths', 'Tells Astro which pages to build.'], ['Astro.props', 'The data passed from <code>getStaticPaths</code>.']] });
      content.push({ p: CONTENTFUL_NOTE });
    } else {
      content.push({ file: 'src/content/blog/hello-world.md', lang: 'text', code: POST, lines: POST_LINES });
      content.push({ file: 'src/content.config.ts', lang: 'typescript', code: "import { defineCollection } from 'astro:content';\nimport { glob } from 'astro/loaders';\nimport { z } from 'astro/zod';\n\nconst blog = defineCollection({\n  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),\n  schema: z.object({\n    title: z.string(),\n    date: z.coerce.date(),\n  }),\n});\n\nexport const collections = { blog };\n", lines: [['defineCollection', 'Declares a group of content.'], ['glob', 'Finds your Markdown files.'], ['schema', 'Checks each file\'s front matter during the build, so a missing title stops the build instead of breaking a page.'], ['z.coerce.date', 'Turns the date text into a real date.']] });
      content.push({ file: 'src/pages/index.astro', lang: 'html', code: "---\nimport { getCollection } from 'astro:content';\n\nconst posts = (await getCollection('blog')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());\n---\n\n<html lang=\"en\">\n  <head><meta charset=\"utf-8\" /><title>My site</title></head>\n  <body>\n    <h1>My site</h1>\n    <ul>\n      {posts.map((post) => <li><a href={`/posts/${post.id}/`}>{post.data.title}</a></li>)}\n    </ul>\n  </body>\n</html>\n", lines: [['--- block', 'Code that runs during the build. Nothing here reaches the browser.'], ['getCollection', 'Loads every post. Its order isn\'t guaranteed, so this sorts by date.'], ['{posts.map(...)}', 'Turns each post into a list item.']] });
      content.push({ file: 'src/pages/posts/[id].astro', lang: 'html', code: "---\nimport { getCollection, render } from 'astro:content';\n\nexport async function getStaticPaths() {\n  const posts = await getCollection('blog');\n  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));\n}\n\nconst { post } = Astro.props;\nconst { Content } = await render(post);\n---\n\n<html lang=\"en\">\n  <head><meta charset=\"utf-8\" /><title>{post.data.title}</title></head>\n  <body>\n    <h1>{post.data.title}</h1>\n    <Content />\n  </body>\n</html>\n", lines: [['[id]', 'The brackets make one page per value.'], ['getStaticPaths', 'Tells Astro which pages to build.'], ['render', 'Turns the Markdown into a component.'], ['&lt;Content /&gt;', 'Shows the post\'s text.']] });
    }
    s.push({ id: 'content', title: 'Add your content', items: content });
    if (a.contentSource === 'git-cms') s.push({ id: 'cms', title: 'Add the editor', items: decapItems(a, 'public/admin', 'src/content/blog', 'public/images', '/images') });
    s.push({ id: 'test', title: 'Build and check it', items: headless ? [
      { cmd: 'npm run build', manual: true, lines: [['npm run build', 'Writes the finished site to the <code>dist</code> folder.']] }
    ] : [
      { cmd: 'npm run build\ntest -f dist/posts/hello-world/index.html && grep -q "first post" dist/posts/hello-world/index.html && echo "The post was built"', lines: [['npm run build', 'Writes the finished site to the <code>dist</code> folder.'], ['test and grep', 'Check that the post became a page, with its text in it.']] },
      { p: 'Then see it at the address this prints, and watch it update as you save:' },
      { cmd: 'npm run dev', manual: true, lines: [['npm run dev', 'Starts a local preview. Press Ctrl+C to stop it.']] }
    ] });
    var gh = { file: '.github/workflows/deploy.yml', lang: 'yaml', code: "name: Deploy to GitHub Pages\n\non:\n  push:\n    branches: [main]\n  workflow_dispatch:\n\npermissions:\n  contents: read\n  pages: write\n  id-token: write\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n      - uses: withastro/action@v6\n\n  deploy:\n    needs: build\n    runs-on: ubuntu-latest\n    environment:\n      name: github-pages\n      url: ${{ steps.deployment.outputs.page_url }}\n    steps:\n      - id: deployment\n        uses: actions/deploy-pages@v5\n", lines: [['withastro/action', 'Astro\'s official action, which builds the site and uploads it.'], ['deploy-pages', 'Publishes what the first job uploaded.']] };
    var hosting = hostItems(a, 'dist', 'npm run build', gh);
    if (a.contentHost === 'github-pages') hosting.unshift({ p: 'In <code>astro.config.mjs</code>, set <code>site</code> to <code>https://your-name.github.io</code>, and <code>base</code> to <code>/your-repo</code> unless your repository is named <code>your-name.github.io</code>.' });
    s.push({ id: 'deploy', title: 'Deploy it', items: hosting });
    return s;
  };

  ready.hugo = function (a) {
    var s = [];
    var headless = a.contentSource === 'headless';
    s.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'Download Hugo from its <a href="https://github.com/gohugoio/hugo/releases/latest">releases page</a>, unpack it and add its folder to your <code>PATH</code>. It\'s one program, so there\'s no installer. You can also use <code>winget install -e --id Hugo.Hugo.Extended</code> on Windows or your usual package manager elsewhere. ' + TERMINAL },
      { cmd: 'hugo version', lines: [['hugo version', 'This guide needs v0.158 or later.']] }
    ] });
    s.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'hugo new project demo\ncd demo', lines: [['hugo new project', 'Creates the folders Hugo expects.']] },
      { file: 'hugo.toml', lang: 'text', code: "baseURL = 'https://example.org/'\nlocale = 'en-us'\ntitle = 'My site'\ndisableKinds = ['taxonomy', 'term']\n", lines: [['disableKinds', 'Turns off tag and category pages, which this small site doesn\'t have templates for.'], ['baseURL', 'Your site\'s address. It must start with the protocol and end with a slash.'], ['title', 'Available to templates.']] },
      { p: 'Most Hugo sites use a ready-made theme, as Hugo\'s <a href="https://gohugo.io/getting-started/quick-start/">quick start</a> shows. This guide writes three small templates instead, so you can see how Hugo works.' },
      { file: 'layouts/home.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<head><meta charset=\"utf-8\"><title>{{ site.Title }}</title></head>\n<body>\n  <h1>{{ site.Title }}</h1>\n  <ul>\n    {{ range site.RegularPages }}\n      <li><a href=\"{{ .RelPermalink }}\">{{ .Title }}</a></li>\n    {{ end }}\n  </ul>\n</body>\n</html>\n", lines: [['layouts/home.html', 'The template for the home page.'], ['{{ }}', 'Hugo\'s template language.'], ['range site.RegularPages', 'Repeats for every page of content.'], ['.RelPermalink', 'That page\'s address.']] },
      { file: 'layouts/page.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<head><meta charset=\"utf-8\"><title>{{ .Title }}</title></head>\n<body>\n  <h1>{{ .Title }}</h1>\n  {{ .Content }}\n</body>\n</html>\n", lines: [['layouts/page.html', 'The template for each post.'], ['.Content', 'The post\'s Markdown, turned into HTML.']] },
      { file: 'layouts/section.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<head><meta charset=\"utf-8\"><title>{{ .Title }}</title></head>\n<body>\n  <h1>{{ .Title }}</h1>\n  <ul>\n    {{ range .Pages }}\n      <li><a href=\"{{ .RelPermalink }}\">{{ .Title }}</a></li>\n    {{ end }}\n  </ul>\n</body>\n</html>\n", lines: [['layouts/section.html', 'The template for a folder of posts, such as <code>/posts/</code>.']] }
    ] });
    var c = [];
    if (headless) {
      c.push({ p: CONTENTFUL_INTRO }, { cmd: 'export HUGO_CONTENTFUL_SPACE=your-space-id\nexport HUGO_CONTENTFUL_TOKEN=your-delivery-api-key', manual: true, lines: [['HUGO_', 'Hugo\'s security settings only let templates read variables that start with this.']] });
      c.push({ file: 'content/posts/_content.gotmpl', lang: 'text', code: "{{ $url := printf \"https://cdn.contentful.com/spaces/%s/environments/master/entries?content_type=post&access_token=%s\" (getenv \"HUGO_CONTENTFUL_SPACE\") (getenv \"HUGO_CONTENTFUL_TOKEN\") }}\n{{ with resources.GetRemote $url }}\n  {{ range (. | transform.Unmarshal).items }}\n    {{ $content := dict \"mediaType\" \"text/markdown\" \"value\" .fields.body }}\n    {{ $.AddPage (dict \"path\" .sys.id \"title\" .fields.title \"content\" $content) }}\n  {{ end }}\n{{ end }}\n", lines: [['_content.gotmpl', 'A content adapter: Hugo runs it and creates pages from outside data.'], ['resources.GetRemote', 'Fetches from Contentful during the build.'], ['AddPage', 'Creates one page per entry.']] }, { p: CONTENTFUL_NOTE });
    } else {
      c.push({ file: 'content/posts/hello-world.md', lang: 'text', code: POST, lines: POST_LINES });
    }
    s.push({ id: 'content', title: 'Add your content', items: c });
    if (a.contentSource === 'git-cms') s.push({ id: 'cms', title: 'Add the editor', items: decapItems(a, 'static/admin', 'content/posts', 'static/images', '/images') });
    s.push({ id: 'test', title: 'Build and check it', items: headless ? [{ cmd: 'hugo', manual: true, lines: [['hugo', 'Writes the finished site to the <code>public</code> folder.']] }] : [
      { cmd: 'hugo\ntest -f public/posts/hello-world/index.html && grep -q "first post" public/posts/hello-world/index.html && echo "The post was built"', lines: [['hugo', 'Writes the finished site to the <code>public</code> folder.'], ['test and grep', 'Check that the post became a page, with its text in it.']] },
      { cmd: 'hugo server', manual: true, lines: [['hugo server', 'Starts a local preview that updates as you save. Press Ctrl+C to stop it.']] }
    ] });
    var gh = { file: '.github/workflows/hugo.yaml', lang: 'yaml', code: "name: Deploy to GitHub Pages\n\non:\n  push:\n    branches: [main]\n  workflow_dispatch:\n\npermissions:\n  contents: read\n  pages: write\n  id-token: write\n\nenv:\n  HUGO_VERSION: 0.169.0\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n      - id: pages\n        uses: actions/configure-pages@v6\n      - name: Install Hugo\n        run: |\n          curl -sLJO \"https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz\"\n          tar -xf \"hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz\" hugo\n      - run: ./hugo build --gc --minify --baseURL \"${{ steps.pages.outputs.base_url }}/\"\n      - uses: actions/upload-pages-artifact@v5\n        with:\n          path: ./public\n\n  deploy:\n    needs: build\n    runs-on: ubuntu-latest\n    environment:\n      name: github-pages\n      url: ${{ steps.deployment.outputs.page_url }}\n    steps:\n      - id: deployment\n        uses: actions/deploy-pages@v5\n", lines: [['HUGO_VERSION', 'Keeps builds on a known version. This is the current version as I write this.'], ['configure-pages', 'Finds your site\'s address.'], ['--baseURL', 'Builds links for that address.'], ['upload-pages-artifact', 'Hands the finished files to the next job.'], ['deploy-pages', 'Publishes them.']] };
    var host = hostItems(a, 'public', 'hugo', gh);
    if (a.contentHost === 'cloudflare') host = host.filter(function (i) { return !(i.cmd && i.noRunUnlessNode); }).map(function (i) { return i; });
    if (a.contentHost === 'cloudflare') host.splice(1, 0, { p: 'You\'ll need <a href="https://nodejs.org/en/download">Node.js</a> for Cloudflare\'s tool. <code>npx</code> downloads it when you first use it.' });
    s.push({ id: 'deploy', title: 'Deploy it', items: host });
    return s;
  };

  ready.nextjs = function (a) {
    var s = [];
    var headless = a.contentSource === 'headless';
    s.push({ id: 'tools', title: 'Install your tools', items: [{ p: 'You need <a href="https://nodejs.org/en/download">Node.js</a> 20.9 or newer. ' + TERMINAL + ' ' + NODE_NOTE }, { cmd: 'node --version', lines: [['node', 'Next.js runs on Node while it builds. A static export doesn\'t need it afterwards.']] }] });
    s.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'npx --yes create-next-app@latest demo --yes --no-tailwind --no-agents-md\ncd demo' + (headless ? '' : '\nnpm install gray-matter marked'), lines: [['create-next-app', 'Creates a Next.js project.'], ['--yes', 'Accepts the defaults: TypeScript, ESLint and the App Router.'], ['--no-tailwind', 'Leaves out Tailwind CSS, because this guide adds no styling.']].concat(headless ? [] : [['gray-matter', 'Reads the front matter at the top of Markdown files.'], ['marked', 'Turns Markdown into HTML.']]) },
      { file: 'next.config.ts', lang: 'typescript', code: "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  output: 'export',\n};\n\nexport default nextConfig;\n", lines: [["output: 'export'", 'Builds plain files into the <code>out</code> folder, so any static host can serve them. Features that need a running server, such as cookies, Server Actions and dynamic route handlers, won\'t work.']] }
    ] });
    var c = [];
    if (headless) {
      c.push({ p: CONTENTFUL_INTRO }, { cmd: CONTENTFUL_ENV, manual: true, lines: [['CONTENTFUL_TOKEN', 'Reads published content. Keep it out of Git anyway.']] });
      c.push({ file: 'lib/posts.ts', lang: 'typescript', code: "export type Post = { slug: string; title: string; date: string; html: string };\n\nexport async function getPosts(): Promise<Post[]> {\n  const url = `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE}/environments/master/entries?content_type=post&access_token=${process.env.CONTENTFUL_TOKEN}`;\n  const res = await fetch(url);\n  if (!res.ok) throw new Error('Contentful error ' + res.status);\n  const data = await res.json();\n  return data.items.map((item: { sys: { id: string }; fields: { title: string; date: string; body: string } }) => ({ slug: item.sys.id, title: item.fields.title, date: item.fields.date, html: item.fields.body }));\n}\n", lines: [['cdn.contentful.com', 'Contentful\'s read-only API.'], ['process.env', 'Read during the build, so these values never reach the browser.']] }, { p: CONTENTFUL_NOTE });
    } else {
      c.push({ file: 'content/posts/hello-world.md', lang: 'text', code: POST, lines: POST_LINES });
      c.push({ file: 'lib/posts.ts', lang: 'typescript', code: "import fs from 'node:fs';\nimport path from 'node:path';\nimport matter from 'gray-matter';\nimport { marked } from 'marked';\n\nexport type Post = { slug: string; title: string; date: string; html: string };\n\nconst folder = path.join(process.cwd(), 'content/posts');\n\nexport async function getPosts(): Promise<Post[]> {\n  const posts = await Promise.all(\n    fs.readdirSync(folder)\n      .filter((name) => name.endsWith('.md'))\n      .map(async (name) => {\n        const { data, content } = matter(fs.readFileSync(path.join(folder, name), 'utf8'));\n        return { slug: name.replace(/\\.md$/, ''), title: String(data.title), date: String(data.date), html: await marked.parse(content) };\n      }),\n  );\n  return posts.sort((a, b) => b.date.localeCompare(a.date));\n}\n", lines: [['fs.readdirSync', 'Lists your Markdown files. This only runs during the build.'], ['matter', 'Splits a file into its front matter and text.'], ['marked.parse', 'Turns the Markdown into HTML.'], ['sort', 'Puts the newest post first.']] });
    }
    c.push({ file: 'app/page.tsx', lang: 'tsx', code: "import Link from 'next/link';\nimport { getPosts } from '@/lib/posts';\n\nexport default async function Home() {\n  const posts = await getPosts();\n  return (\n    <main>\n      <h1>My site</h1>\n      <ul>\n        {posts.map((post) => (\n          <li key={post.slug}>\n            <Link href={`/posts/${post.slug}`}>{post.title}</Link>\n          </li>\n        ))}\n      </ul>\n    </main>\n  );\n}\n", lines: [['async function Home', 'A Server Component. It runs during the build, so only HTML reaches the browser.'], ['Link', 'Moves between pages without a full reload.']] });
    c.push({ file: 'app/posts/[slug]/page.tsx', lang: 'tsx', code: "import { getPosts } from '@/lib/posts';\n\nexport async function generateStaticParams() {\n  return (await getPosts()).map((post) => ({ slug: post.slug }));\n}\n\nexport default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  const post = (await getPosts()).find((p) => p.slug === slug)!;\n  return (\n    <main>\n      <h1>{post.title}</h1>\n      <div dangerouslySetInnerHTML={{ __html: post.html }} />\n    </main>\n  );\n}\n", lines: [['[slug]', 'A folder in brackets makes one page per value.'], ['generateStaticParams', 'Lists the pages to build. A static export requires it.'], ['params', 'A promise in current Next.js, so it needs <code>await</code>.'], ['dangerouslySetInnerHTML', 'Inserts HTML as it is. That\'s fine for your own content, but never use it with text from visitors.']] });
    s.push({ id: 'content', title: 'Add your content', items: c });
    if (a.contentSource === 'git-cms') s.push({ id: 'cms', title: 'Add the editor', items: decapItems(a, 'public/admin', 'content/posts', 'public/images', '/images') });
    s.push({ id: 'test', title: 'Build and check it', items: headless ? [{ cmd: 'npm run build', manual: true, lines: [['npm run build', 'Writes the finished site to the <code>out</code> folder.']] }] : [
      { cmd: 'npm run build\ntest -f out/posts/hello-world.html && grep -q "first post" out/posts/hello-world.html && echo "The post was built"', lines: [['npm run build', 'Writes the finished site to the <code>out</code> folder.'], ['test and grep', 'Check that the post became a page, with its text in it.']] },
      { cmd: 'npm run dev', manual: true, lines: [['npm run dev', 'Starts a local preview that updates as you save. Press Ctrl+C to stop it.']] }
    ] });
    s.push({ id: 'deploy', title: 'Deploy it', items: hostItems(a, 'out', 'npm run build', null) });
    return s;
  };

  function dockerHosting(a, compose, port, envNote) {
    if (a.hosting === 'kubernetes') return [{ warn: 'Kubernetes is far more than this stack needs. Use a managed container service or one server unless you already run a cluster. Its <a href="https://kubernetes.io/docs/home/">docs</a> cover turning this into a deployment.' }];
    var i = [];
    if (a.hosting === 'paas' || a.hosting === 'containers') i.push({ p: 'Use your provider\'s container service, such as <a href="https://render.com/docs/web-services">Render</a> or <a href="https://cloud.google.com/run/docs">Google Cloud Run</a>, with its managed database. ' + envNote });
    if (a.hosting === 'vps') i.push({ p: 'Rent a Linux server, install <a href="https://docs.docker.com/engine/install/">Docker</a>, and point your domain at it. Install <a href="https://caddyserver.com/docs/install">Caddy</a> for HTTPS, and have it forward to port ' + port + '. You\'re responsible for updates, backups and a firewall. ' + envNote });
    return i;
  }

  function wpCore(a) {
    var items = [];
    if (a.hosting === 'managed-wp') {
      items.push({ p: 'Choose a host from <a href="https://wordpress.org/hosting/">WordPress\'s hosting page</a>. It installs WordPress for you, including the database and HTTPS. Log in at <code>https://your-site/wp-admin</code>.' });
      return items;
    }
    items.push({ p: 'The official Docker image runs WordPress with no PHP setup. For local testing, install <a href="https://docs.docker.com/get-started/get-docker/">Docker</a>. WordPress recommends PHP 8.3 or newer and MySQL 8.0 or MariaDB 10.11 or newer, which these images provide.' });
    items.push({ file: 'compose.yaml', lang: 'yaml', code: "services:\n  wordpress:\n    image: wordpress\n    restart: always\n    ports:\n      - 8080:80\n    environment:\n      WORDPRESS_DB_HOST: db\n      WORDPRESS_DB_USER: wordpress\n      WORDPRESS_DB_PASSWORD: ${DB_PASSWORD}\n      WORDPRESS_DB_NAME: wordpress\n    volumes:\n      - wordpress:/var/www/html\n\n  db:\n    image: mysql:8.0\n    restart: always\n    environment:\n      MYSQL_DATABASE: wordpress\n      MYSQL_USER: wordpress\n      MYSQL_PASSWORD: ${DB_PASSWORD}\n      MYSQL_RANDOM_ROOT_PASSWORD: '1'\n    volumes:\n      - db:/var/lib/mysql\n\nvolumes:\n  wordpress:\n  db:\n", lines: [['services', 'Two containers: WordPress and its database.'], ['8080:80', 'Your machine\'s port 8080 reaches WordPress.'], ['${DB_PASSWORD}', 'Comes from your environment, so the password stays out of this file.'], ['volumes', 'Keep your uploads and data when containers restart.']] });
    items.push({ cmd: 'export DB_PASSWORD="$(openssl rand -hex 16)"\ndocker compose up -d', manual: true, lines: [['openssl rand', 'Makes a random password. Save it, because you need the same one next time.'], ['docker compose up -d', 'Starts both containers in the background.']] });
    items.push({ p: 'Open <code>http://localhost:8080</code>. WordPress asks for a site title, admin user, password and email. Use a long password, because attackers try the login page constantly.' });
    return items;
  }
  function wpDeploy(a) {
    var i = [];
    if (a.hosting === 'managed-wp') i.push({ p: 'Your host already runs the site. Point your domain at it from the host\'s dashboard, and it sets up HTTPS.' });
    else i = i.concat(dockerHosting(a, true, 8080, 'Keep <code>DB_PASSWORD</code> in the service\'s secret settings, and keep the uploads folder on a persistent disk.'));
    i.push({ warn: 'Keep WordPress, themes and plugins updated, and turn on automatic updates. Outdated plugins are the most common way WordPress sites get hacked. Take regular backups of the database and uploads.' });
    i.push({ p: 'I didn\'t run this, because I couldn\'t use Docker on my test machine. The steps come from the official docs and image page.' });
    return i;
  }
  ready.wordpress = function (a) {
    return [
      { id: 'install', title: 'Install WordPress', items: wpCore(a) },
      { id: 'content', title: 'Add your content', items: [{ p: 'Log in at <code>/wp-admin</code>. Under <strong>Appearance</strong>, <strong>Themes</strong>, choose a theme. Under <strong>Pages</strong> and <strong>Posts</strong>, add content. Editors work directly in this screen, with no code or Git.' }, { p: 'Add plugins carefully. Each one is code running on your site, so check when it was last updated and how many sites use it.' }] },
      { id: 'deploy', title: 'Put it online', items: wpDeploy(a) }
    ];
  };
  ready.woocommerce = function (a) {
    var pay = {
      stripe: 'Install <a href="https://wordpress.org/plugins/woocommerce-gateway-stripe/">WooCommerce Stripe Payment Gateway</a>, connect your Stripe account, and turn on test mode. Pay with card number <code>4242 4242 4242 4242</code>.',
      paypal: 'Install <a href="https://wordpress.org/plugins/woocommerce-paypal-payments/">WooCommerce PayPal Payments</a>, connect your PayPal account, and turn on sandbox mode.',
      klarna: 'Install <a href="https://wordpress.org/plugins/klarna-payments-for-woocommerce/">Klarna for WooCommerce</a>, add your Klarna credentials and turn on test mode.',
      adyen: 'Adyen\'s WooCommerce plugin is built by its partner Woosa and isn\'t in the WordPress plugin directory. Follow <a href="https://www.woosa.com/woocommerce-plugins/payments/adyen/">Woosa\'s Adyen plugin docs</a>, which <a href="https://docs.adyen.com/plugins/">Adyen lists</a> as its WooCommerce plugin, and use the test environment first.'
    }[a.payment];
    return [
      { id: 'install', title: 'Install WordPress', items: wpCore(a) },
      { id: 'store', title: 'Add WooCommerce', items: [
        { p: 'WooCommerce 10.8 and later need WordPress 6.9, PHP 8.3, MySQL 8.0 or MariaDB 10.6, HTTPS, and a 256 MB WordPress memory limit. Check these with your host.' },
        { p: 'In <code>/wp-admin</code>, go to <strong>Plugins</strong>, <strong>Add New</strong>, search for <strong>WooCommerce</strong>, then install and activate it. Follow its setup wizard, which asks for your store name, location and what you sell. Then work through its checklist: add products, set up tax and shipping.' },
        { p: 'Customer accounts and the admin area are built in, so you don\'t need separate login or admin tools.' }
      ] },
      { id: 'pay', title: 'Add payments', items: [{ p: pay }, { p: 'Then go to <strong>WooCommerce</strong>, <strong>Settings</strong>, <strong>Payments</strong>, and turn it on. Place a test order from start to finish before you go live, and check that its status changes after payment.' }] },
      { id: 'deploy', title: 'Put it online', items: wpDeploy(a).concat([{ warn: 'A store handles personal data and orders, so back it up often and check your local tax and privacy rules. Don\'t turn off Coming Soon mode until a test order has worked.' }]) }
    ];
  };
  ready.shopify = function (a) {
    return [
      { id: 'store', title: 'Create your store', items: [
        { p: 'Shopify runs the whole store: hosting, checkout, payments, accounts and admin. Sign up at <a href="https://www.shopify.com/">shopify.com</a>, then add products and turn on a payment option under <strong>Settings</strong>, <strong>Payments</strong>. Much of the setup needs no code.' },
        { p: 'Use <strong>Online Store</strong>, <strong>Themes</strong> to pick a ready-made theme. You only need the next step to write your own.' }
      ] },
      { id: 'theme', title: 'Write your own theme (optional)', items: [
        { p: 'You need <a href="https://nodejs.org/en/download">Node.js</a> 22.12 or newer and Git 2.28 or newer, and a <a href="https://shopify.dev/docs/storefronts/themes/getting-started/create">development store</a> where you are the owner or staff. ' + TERMINAL },
        { cmd: 'npm install -g @shopify/cli@latest', manual: true, lines: [['-g', 'Installs the tool for your whole user account.']] },
        { cmd: 'shopify theme init\ncd my-new-theme\nshopify theme dev --store my-store', manual: true, lines: [['theme init', 'Asks for a name and creates a theme from Shopify\'s Skeleton starter.'], ['theme dev', 'Previews it at <code>http://127.0.0.1:9292</code> using your store\'s data. The preview only works in Chrome.'], ['--store', 'Your store. Only needed the first time.']] },
        { cmd: 'shopify theme push --unpublished\nshopify theme publish', manual: true, lines: [['--unpublished', 'Uploads as a new theme, without changing your live store. Use it for the first push.'], ['theme publish', 'Makes a theme live, after asking you to confirm.']] }
      ] },
      { id: 'launch', title: 'Launch', items: [{ p: 'Place a test order, choose a plan, and connect your domain under <strong>Settings</strong>, <strong>Domains</strong>. Shopify handles HTTPS and hosting.' }, { p: 'I didn\'t run this, because it needs a Shopify account. The commands come from Shopify\'s docs.' }] }
    ];
  };
  ready.medusa = function (a) {
    var pay = [];
    if (a.payment === 'stripe') pay.push({ p: 'In <code>apps/backend/medusa-config.ts</code>, add this to the object passed to <code>defineConfig</code>, then set <code>STRIPE_API_KEY</code> and add Stripe to a region in the admin. See <a href="https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe">Medusa\'s Stripe docs</a>.' }, { file: 'apps/backend/medusa-config.ts (add)', noRun: true, lang: 'typescript', code: "modules: [\n  {\n    resolve: '@medusajs/medusa/payment',\n    options: {\n      providers: [\n        {\n          resolve: '@medusajs/medusa/payment-stripe',\n          id: 'stripe',\n          options: { apiKey: process.env.STRIPE_API_KEY },\n        },\n      ],\n    },\n  },\n],\n", lines: [['modules', 'Adds optional features to Medusa.'], ['payment-stripe', 'Medusa\'s Stripe provider.'], ['apiKey', 'Your secret key, from the environment.']] });
    if (a.payment === 'adyen') pay.push({ p: 'Medusa\'s docs list an Adyen provider, as well as Stripe. Follow the <a href="https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider">payment provider docs</a> to add it to <code>medusa-config.ts</code>.' });
    if (a.payment === 'klarna' || a.payment === 'paypal') pay.push({ warn: 'Medusa\'s docs only list Stripe and Adyen as payment providers, so ' + Kit.PAYMENT[a.payment].name + ' needs a community plugin or your own provider. Check the <a href="https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider">payment provider docs</a> first. Klarna is often available through Stripe or Adyen instead.' });
    return [
      { id: 'tools', title: 'Install your tools', items: [{ p: 'You need <a href="https://nodejs.org/en/download">Node.js</a> 22.22 or newer, in a long-term support version, plus Git and <a href="https://www.postgresql.org/download/">PostgreSQL</a> running. ' + TERMINAL }] },
      { id: 'project', title: 'Create the project', items: [
        { cmd: 'npx --yes create-medusa-app@latest demo --with-nextjs-starter --no-browser', medusa: true, lines: [['create-medusa-app', 'Creates the backend, admin and database. It asks for your PostgreSQL login if it needs it.'], ['--with-nextjs-starter', 'Adds the official shop pages in <code>apps/storefront</code>. Medusa keeps these separate from its backend.'], ['--no-browser', 'Doesn\'t open a browser at the end.']] },
        { cmd: 'cd demo/apps/backend\nnpm run dev', manual: true, lines: [['npm run dev', 'Starts the server at <code>http://localhost:9000</code> and the admin at <code>http://localhost:9000/app</code>.']] },
        { p: 'Create an admin user when it asks, or with <code>npx medusa user -e you@example.com -p your-password</code>. Start the shop pages from <code>apps/storefront</code> in another terminal, at <code>http://localhost:8000</code>.' }
      ] },
      { id: 'pay', title: 'Add payments', items: pay },
      { id: 'deploy', title: 'Put it online', items: dockerHosting(a, false, 9000, 'Medusa needs PostgreSQL and Redis.').concat([
        { cmd: 'export COOKIE_SECRET="$(openssl rand -hex 32)" JWT_SECRET="$(openssl rand -hex 32)"', manual: true, lines: [['COOKIE_SECRET and JWT_SECRET', 'Medusa won\'t start in production without them.']] },
        { p: 'Also set <code>DATABASE_URL</code>, <code>REDIS_URL</code>, <code>STORE_CORS</code>, <code>ADMIN_CORS</code>, <code>AUTH_CORS</code> and <code>MEDUSA_BACKEND_URL</code>. Add <code>"predeploy": "medusa db:migrate"</code> to the backend\'s <code>package.json</code> scripts.' },
        { cmd: 'npm run build\ncd .medusa/server && npm install && npm run predeploy && npm run start', manual: true, lines: [['npm run build', 'Writes the production version to <code>.medusa/server</code>.'], ['predeploy', 'Runs database migrations before starting.']] },
        { p: 'Medusa\'s <a href="https://docs.medusajs.com/learn/deployment/general">deployment docs</a> run two copies of the app: a server with <code>MEDUSA_WORKER_MODE=server</code>, and a background worker with <code>MEDUSA_WORKER_MODE=worker</code> and <code>DISABLE_MEDUSA_ADMIN=true</code>. Check <code>/health</code> afterwards.' },
        { p: 'I didn\'t run a deployment, because it needs a host, Redis and an account.' }
      ]) }
    ];
  };
  ready.saleor = function (a) {
    return [
      { id: 'tools', title: 'Choose where Saleor runs', items: [
        { p: 'Saleor is a separate backend with a GraphQL API and an admin dashboard. The simplest start is a free test project on <a href="https://docs.saleor.io/quickstart/storefront">Saleor Cloud</a>, which needs no install.' },
        { p: 'To run it yourself, you need <a href="https://docs.docker.com/get-started/get-docker/">Docker</a>. ' + TERMINAL },
        { cmd: 'git clone https://github.com/saleor/saleor-platform.git\ncd saleor-platform\ndocker compose build\ndocker compose run --rm api python3 manage.py migrate\ndocker compose run --rm api python3 manage.py populatedb\ndocker compose run --rm api python3 manage.py createsuperuser\ndocker compose up', manual: true, lines: [['docker compose build', 'Builds the containers.'], ['migrate', 'Creates the database tables.'], ['populatedb', 'Adds optional sample products.'], ['createsuperuser', 'Creates your admin login.'], ['docker compose up', 'Starts everything. The dashboard is at <code>localhost:9000</code>.']] }
      ] },
      { id: 'front', title: 'Add the shop pages', items: [
        { p: 'Saleor has no shop pages of its own, so use its official Next.js storefront. You need <a href="https://nodejs.org/en/download">Node.js</a> and <a href="https://pnpm.io/installation">pnpm</a>.' },
        { cmd: 'git clone https://github.com/saleor/storefront.git saleor-storefront\ncd saleor-storefront\npnpm i\ncp .env.example .env', manual: true, lines: [['cp .env.example .env', 'Creates your settings file.']] },
        { file: '.env', noRun: true, lang: 'text', code: '# Saleor Cloud, including the trailing slash\nNEXT_PUBLIC_SALEOR_API_URL=https://your-domain.saleor.cloud/graphql/\n\n# Or your own Saleor\n# NEXT_PUBLIC_SALEOR_API_URL=http://localhost:8000/graphql/\n', lines: [['NEXT_PUBLIC_SALEOR_API_URL', 'Where the shop pages find your store.']] },
        { cmd: 'pnpm run dev', manual: true, lines: [['pnpm run dev', 'Starts the shop pages locally.']] }
      ] },
      { id: 'pay', title: 'Add payments', items: [
        { p: 'Saleor adds payments through apps, which you browse in its <a href="https://docs.saleor.io/developer/app-store/overview">integrations catalog</a> and install from the dashboard. Check that the catalog has ' + Kit.PAYMENT[a.payment].name + ' for your region, and try it in test mode first. I couldn\'t confirm from Saleor\'s docs which providers it covers.' }
      ] },
      { id: 'deploy', title: 'Put it online', items: dockerHosting(a, false, 8000, 'Saleor needs PostgreSQL and Redis. Saleor Cloud runs all of this for you.').concat([{ p: 'Deploy the storefront separately, as any Next.js app. I didn\'t run any of this, because it needs Docker or a Saleor account.' }]) }
    ];
  };

  var planFramework = Kit.plan;
  Kit.plan = function (a) {
    if (a.framework) return planFramework(a);
    return ready[a.siteStack] ? ready[a.siteStack](a) : null;
  };
})(StackKit);
