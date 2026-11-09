// @ts-nocheck -- moved from the single-file page; types are added module by module.
// The question tree. Java web-app options come from JAVA_DATA, which assemble.py extracts from the earlier page.
export const Tree: any = (function () {
  function o(id, name, sum, pros, cons, url, start) { return { id: id, name: name, sum: sum, pros: pros, cons: cons, url: url, start: !!start }; }

  var CONTENT_STACK = [
    o('astro', 'Astro', 'Builds fast pages from components and Markdown, sending little JavaScript by default.',
      ['Very fast pages by default', 'Works with React, Vue and others', 'Great Markdown support', 'Can be hosted as plain files', 'Add interactivity only where needed'],
      ['Its team joined Cloudflare in 2026, though it stays MIT-licensed', 'Less suited to app-like sites', 'Needs Node for building', 'Non-technical editors need a CMS added', 'Major versions can require migration work'], 'https://docs.astro.build/', true),
    o('hugo', 'Hugo', 'A very fast static site generator, delivered as a single program.',
      ['Extremely fast builds', 'One portable binary with no setup', 'No runtime dependencies', 'Output is plain files', 'Strong content features such as taxonomies'],
      ['Go template syntax can feel awkward', 'Custom logic is limited', 'Fewer component-style tools', 'Non-technical editors need a CMS added', 'Theme quality varies'], 'https://gohugo.io/documentation/'),
    o('nextjs', 'Next.js', 'A React framework that can mix static pages with server code.',
      ['Very large ecosystem', 'Can grow into a full web app', 'Mixes static and server rendering', 'Uses React skills', 'Many hosting options'],
      ['Heavy for a simple site', 'More concepts to learn', 'Frequent changes between versions', 'Sends more JavaScript by default', 'Best-supported features can favor its vendor Vercel'], 'https://nextjs.org/docs'),
    o('wordpress', 'WordPress', 'A PHP content system with a built-in editor and a huge plugin library.',
      ['Non-technical editors can publish immediately', 'Huge theme and plugin library', 'Cheap hosting is everywhere', 'Large community', 'Quick to launch without code'],
      ['Needs regular security updates', 'Plugins vary in quality and can conflict', 'Written in PHP', 'Slower without caching', 'Common target for automated attacks'], 'https://wordpress.org/documentation/'),
    o('custom', 'Custom backend', 'Write your own server. This adds a backend language and the rest of the web app questions.',
      ['Complete control', 'Good way to learn backend development', 'Can share code with a future app', 'No plugin limits', 'Fits unusual requirements'],
      ['Most work of these options', 'You rebuild what content tools already provide', 'More to host and secure', 'Editors need an interface you build', 'Overkill for mostly static pages'], null)
  ];
  var CONTENT_SOURCE = [
    o('git', 'Markdown files in Git', 'Pages are text files stored with your code.',
      ['Free, with no extra service', 'Full history through Git', 'Easy to review changes', 'Works offline', 'No vendor lock-in'],
      ['Awkward for non-technical editors', 'No visual preview without tooling', 'Images need manual handling', 'Publishing depends on a build', 'Limited editorial workflows'], 'https://docs.github.com/en/get-started/writing-on-github', true),
    o('git-cms', 'Git-based CMS', 'A tool such as Decap CMS gives editors a web form, and saves to your Git repository.',
      ['Friendly editor on top of Git', 'Content stays in your repository', 'Usually free', 'No database to run', 'Easy to leave later'],
      ['Editor authentication takes setup', 'Fewer features than hosted CMSs', 'Publishing still needs a rebuild', 'Large sites can feel slow', 'Smaller communities'], 'https://decapcms.org/docs/'),
    o('headless', 'Hosted headless CMS', 'A service such as Sanity or Contentful stores content, and your site fetches it through an API.',
      ['Polished editing experience', 'Good roles and workflows', 'Structured, reusable content', 'Handles images well', 'Nothing to host'],
      ['Costs can grow with usage', 'Vendor lock-in', 'Depends on another service', 'Content models take design work', 'Free tiers have limits'], 'https://www.sanity.io/docs')
  ];
  var CONTENT_HOST = [
    o('cloudflare', 'Cloudflare Workers', 'Hosts static files and server code on a global network. Cloudflare\'s docs now say to start new projects here rather than on Pages.',
      ['Generous free tier', 'Very fast worldwide', 'Deploys from Git', 'Free HTTPS', 'Preview for each branch'],
      ['Server features use Cloudflare-specific runtimes', 'Dashboard has many products to navigate', 'Build limits on free tier', 'Vendor-specific settings', 'Support is limited on free plans'], 'https://developers.cloudflare.com/workers/static-assets/', true),
    o('netlify', 'Netlify', 'A static hosting platform with forms and functions.',
      ['Very simple setup', 'Deploys from Git', 'Built-in forms', 'Preview for each branch', 'Good documentation'],
      ['Usage limits on free plan', 'Costs can jump with traffic', 'Vendor-specific features', 'Functions add lock-in', 'Fewer edge locations than some rivals'], 'https://docs.netlify.com/'),
    o('github-pages', 'GitHub Pages', 'Free static hosting directly from a GitHub repository.',
      ['Free', 'Lives beside your code', 'Simple for personal sites', 'Works with GitHub Actions', 'Custom domains supported'],
      ['Static files only', 'Usage limits apply', 'No branch previews by default', 'GitHub says it is not meant for a business, store or SaaS', 'Few settings for headers and redirects'], 'https://docs.github.com/en/pages'),
    o('vps-static', 'A virtual private server', 'Rent a Linux server and serve files with Caddy or nginx.',
      ['Predictable monthly cost', 'Full control', 'Can host other things too', 'Good way to learn Linux', 'No vendor lock-in'],
      ['You handle security updates', 'You handle backups', 'One server can fail', 'Manual scaling', 'More work than static hosts'], 'https://caddyserver.com/docs/')
  ];

  var STORE_STACK = [
    o('shopify', 'Shopify', 'A fully hosted store platform with a monthly fee.',
      ['Fastest way to start selling', 'Hosting and security are handled', 'Built-in checkout and payments', 'Large app store', 'Works for non-technical staff'],
      ['Monthly fees and app costs', 'Extra transaction fee if you use another payment provider', 'Limited control over checkout', 'Harder to leave later', 'Customization uses its own Liquid language', 'You write little backend code'], 'https://shopify.dev/docs', true),
    o('woocommerce', 'WooCommerce', 'A free store plugin for WordPress that you host yourself.',
      ['Free core plugin', 'Huge plugin ecosystem', 'Full ownership of your data', 'Cheap hosting available', 'Content and store in one place'],
      ['You handle updates and security', 'Written in PHP', 'Performance needs attention', 'Paid plugins add up', 'Plugins can conflict'], 'https://woocommerce.com/documentation/'),
    o('medusa', 'Medusa', 'An open-source commerce backend in TypeScript, with your own storefront.',
      ['Developer-friendly and customizable', 'Open source', 'Separate storefront gives design freedom', 'Modern TypeScript stack', 'No per-sale platform fee from the software itself'],
      ['You build or adapt a storefront', 'You host and maintain it', 'Smaller ecosystem than Shopify', 'Needs PostgreSQL and Redis', 'Fewer ready-made integrations'], 'https://docs.medusajs.com/'),
    o('saleor', 'Saleor', 'An open-source commerce platform in Python, with a GraphQL API.',
      ['Strong GraphQL API', 'Handles multiple channels and currencies', 'Open source', 'Separate storefront', 'Hosted option available'],
      ['More complex to self-host', 'You build a storefront', 'GraphQL adds learning', 'Smaller community than Shopify', 'Heavier for small stores'], 'https://docs.saleor.io/'),
    o('custom', 'Custom backend', 'Build the store yourself. This adds a backend language and the rest of the web app questions.',
      ['Complete control', 'Fits unusual business rules', 'No platform fees', 'Great learning project', 'Own all of your code'],
      ['Most work by far', 'Tax, shipping and discounts are complicated', 'Security risk is yours', 'Slow to launch', 'Ongoing maintenance'], null)
  ];
  var PAYMENT = [
    o('stripe', 'Stripe', 'A payment API that takes a fee per transaction.',
      ['Excellent documentation', 'Hosted checkout reduces card-security work', 'Good test mode', 'Supports many payment methods', 'Libraries for every major language'],
      ['Per-transaction fees', 'Account can be held for review', 'Support varies', 'Some methods vary by country', 'Advanced tax features cost extra'], 'https://docs.stripe.com/', true),
    o('klarna', 'Klarna', 'Popular in Sweden and Europe, with pay-later options.',
      ['Well known to Nordic customers', 'Pay-later can suit larger purchases', 'Checkout handles many methods', 'Merchant takes less credit risk', 'Strong regional presence'],
      ['Less suited to global stores', 'Merchant fees can be higher', 'Merchant approval needed', 'Less developer-friendly than Stripe', 'Pay-later has compliance implications'], 'https://docs.klarna.com/'),
    o('adyen', 'Adyen', 'An enterprise payment platform, used by large merchants.',
      ['Very wide payment coverage', 'Built for large volumes', 'One platform for online and in-store', 'Strong fraud tools', 'Good reporting'],
      ['Aimed at larger businesses', 'Harder to get started', 'Minimum volumes may apply', 'More complex integration', 'Overkill for a small store'], 'https://docs.adyen.com/'),
    o('paypal', 'PayPal', 'A widely recognized wallet and payment service.',
      ['Customers already know and trust it', 'Quick to add as an option', 'Buyers needn\'t enter card details', 'Works in many countries', 'Simple for low volumes'],
      ['Fees can be higher', 'Disputes can favor buyers', 'Account holds are a known complaint', 'Checkout leaves your design', 'Older APIs can be confusing'], 'https://developer.paypal.com/docs/')
  ];

  var PLATFORMS = [
    o('pc', 'PC', 'Windows, Mac and Linux. Windows is the main market.',
      ['Largest choice of engines', 'Easy to test while developing', 'Steam gives direct access to players', 'No required publisher approval on most stores', 'Patches ship quickly'],
      ['Many hardware configurations to support', 'Very crowded market', 'Mac and Linux add testing', 'Cheating is easier in multiplayer', 'Keyboard and controller both expected'], null, true),
    o('web', 'Web browser', 'Players click a link and play, with nothing to install.',
      ['No install means less friction', 'Instant updates', 'Works across operating systems', 'Easy to share', 'No store approval'],
      ['Lower performance than native', 'Harder to monetize', 'Download size matters', 'Limited access to hardware', 'Browser differences need testing'], null),
    o('mobile', 'Mobile', 'iPhone and Android, through their app stores.',
      ['Huge potential audience', 'Touch and sensors allow new ideas', 'In-app purchase systems are built in', 'Short sessions suit small games', 'Stores handle payments'],
      ['iOS builds need a Mac', 'Store reviews can delay releases', 'Stores take a revenue share', 'Many device sizes', 'Hard to get noticed'], null),
    o('console', 'Consoles', 'PlayStation, Xbox and Nintendo Switch.',
      ['Dedicated, paying audience', 'Fixed hardware is easier to target', 'Prestige and visibility', 'Controller-first design is clear', 'Strong platform stores'],
      ['Needs approval from each platform', 'Dev kits and NDAs are required', 'Certification is strict', 'Not realistic for a first project', 'Open-source engines may need third-party porting'], null)
  ];
  var G_FULL = 'Full engines with an editor', G_2D = 'Beginner-friendly and 2D-focused', G_CODE = 'Code-first libraries and frameworks', G_WEB = 'Browser libraries';
  function eng(group, plat, opt) { return Object.assign(opt, { group: group, plat: plat }); }
  var ALL = ['pc', 'web', 'mobile', 'console'];
  var ENGINE = [
    eng(G_FULL, ALL, o('godot', 'Godot', 'A free, open-source engine with its own Python-like language, plus C#. It runs without an installer.',
      ['Free with no royalties', 'Small download that runs without installing', 'Small and quick to start', 'Very good for 2D', 'Open source and community driven'],
      ['Smaller asset store', 'Consoles need third-party porting', 'High-end 3D is behind Unreal', 'C# projects can\'t yet export to the web officially', 'Fewer jobs than Unity or Unreal'], 'https://docs.godotengine.org/', true)),
    eng(G_FULL, ALL, o('unity', 'Unity', 'A very widely used engine for 2D, 3D and mobile games, scripted in C#.',
      ['Very large community and tutorials', 'Huge asset store', 'Exports to almost every platform', 'Strong on mobile', 'C# is approachable'],
      ['Proprietary, and free Personal plan has a revenue limit', 'Its cancelled runtime fee hurt developers\' trust', 'Installs through a separate hub', 'Large editor', 'Web builds can be heavy'], 'https://docs.unity.com/')),
    eng(G_FULL, ['pc', 'mobile', 'console'], o('unreal', 'Unreal Engine', 'A high-end 3D engine using C++ and visual Blueprints.',
      ['Top-tier 3D graphics', 'Uses real C++', 'Blueprints speed up prototyping', 'Full source code access', 'Mature multiplayer framework'],
      ['Very large downloads and heavy hardware needs', 'Royalty above a revenue threshold', 'Steep learning curve', 'Overkill for small 2D games', 'Long compile times on larger projects'], 'https://dev.epicgames.com/documentation/en-us/unreal-engine')),
    eng(G_FULL, ALL, o('flax', 'Flax Engine', 'A 3D engine with C# and C++ scripting, and its source code available to read.',
      ['Uses both C# and C++', 'Lists consoles, mobile and web as targets', 'Source available', 'Free for non-commercial and educational use', 'Lighter than Unreal'],
      ['Not open source', '4% royalty above $250,000 per quarter', 'Small community', 'Few tutorials', 'Small asset ecosystem'], 'https://docs.flaxengine.com/')),
    eng(G_FULL, ['pc'], o('stride', 'Stride', 'An open-source 3D engine written in C#, with a full visual editor.',
      ['MIT license with no royalties', 'Engine and game both in C#', 'Full scene and UI editors', 'Modern DirectX 12 and Vulkan support', 'Runs on current .NET'],
      ['Desktop focus, with no confirmed console or web support', 'Small community', 'Few tutorials', 'Small asset ecosystem', 'Primarily Windows tooling'], 'https://doc.stride3d.net/latest/en/manual/')),
    eng(G_FULL, ['pc'], o('o3de', 'Open 3D Engine', 'A large open-source 3D engine from the Linux Foundation, written in C++. It descends from Amazon Lumberyard.',
      ['Open source with no royalties', 'Written in C++', 'High-end 3D renderer', 'Modular design', 'Foundation governance rather than one vendor'],
      ['Very heavy to build and run', 'Steep learning curve', 'Small game-development community', 'Few beginner tutorials', 'Far too much for a small game'], 'https://docs.o3de.org/')),
    eng(G_FULL, ['pc', 'web', 'mobile'], o('cocos', 'Cocos Creator', 'A free engine for 2D and 3D games, scripted in TypeScript and popular for mobile and mini-games.',
      ['Free and open source', 'TypeScript scripting', 'Strong on mobile and web', 'Publishes to many mini-game platforms', 'Lightweight builds'],
      ['No console target listed', 'Community leans toward China', 'Smaller Western community', 'Fewer English tutorials', 'High-end 3D is limited'], 'https://docs.cocos.com/creator/manual/en/')),

    eng(G_2D, ALL, o('gamemaker', 'GameMaker', 'A popular 2D engine with its own simple language. Selling games currently needs a paid license, and its new runtime is due to be free for commercial use from 2027.',
      ['Designed for 2D', 'Very quick to learn', 'Free for non-commercial use', 'Proven by many commercial indie games', 'Exports to desktop, mobile and web'],
      ['Proprietary', 'Selling currently needs a paid license', 'Consoles need the Enterprise plan and developer approval', 'Weak for 3D', 'Its own language has little use elsewhere'], 'https://manual.gamemaker.io/')),
    eng(G_2D, ALL, o('defold', 'Defold', 'A free engine focused on 2D, scripted in Lua, with very small builds.',
      ['No license, royalty or runtime fees', 'Very small builds', 'Exports to consoles, mobile, web and desktop', 'Lua is quick to learn', 'Source available'],
      ['Smaller community than Godot', 'Editor is less polished', 'Weaker for 3D', 'Console access still needs developer approval', 'Message-passing style takes getting used to'], 'https://defold.com/manuals/introduction/')),
    eng(G_2D, ['pc', 'web', 'mobile'], o('construct', 'Construct', 'A browser-based editor for 2D games, using visual event sheets rather than code.',
      ['Runs in your browser, with no install', 'Little or no code needed', 'Very quick for prototypes', 'Strong web export', 'Friendly for beginners'],
      ['Teaches you little programming', 'Full features need a paid plan', 'Desktop and mobile exports are paid features', 'No console export confirmed', 'Proprietary'], 'https://www.construct.net/en/make-games/manuals/construct-3/overview/publishing-projects')),
    eng(G_2D, ['pc', 'web', 'mobile'], o('renpy', 'Ren\'Py', 'An engine for visual novels and story games, written with a simple script language and optional Python.',
      ['Ideal for visual novels', 'Free for commercial use', 'Very easy scripting', 'Python available for complex logic', 'Handles saving and menus for you'],
      ['Only suits story-led games', 'Web export is still in beta', 'No console target listed', 'Limited real-time action', 'Visual style can look similar across games'], 'https://www.renpy.org/doc/html/')),

    eng(G_CODE, ['pc', 'web', 'mobile'], o('libgdx', 'libGDX', 'A cross-platform game framework written in Java.',
      ['Written in Java', 'Apache 2.0 license', 'Exports to desktop, Android, iOS and browsers', 'Mature and community-maintained', 'Full control through code'],
      ['No visual editor like Unity\'s', 'Consoles aren\'t listed as a target', 'You build many of your own tools', 'Fewer ready-made assets', 'Weaker for high-end 3D'], 'https://libgdx.com/wiki/')),
    eng(G_CODE, ['pc', 'mobile', 'console'], o('monogame', 'MonoGame', 'A C# framework, successor to Microsoft XNA, used by commercial indie games.',
      ['Written in C#', 'Supports desktop, mobile and consoles', 'Proven by commercial games', 'Full control through code', 'Open source'],
      ['No Unity-style editor', 'Console access needs platform authorization', 'No web target listed', 'You build many of your own tools', 'Mostly suited to 2D'], 'https://docs.monogame.net/')),
    eng(G_CODE, ['pc', 'web', 'mobile'], o('bevy', 'Bevy', 'A data-driven engine in Rust, with strong memory safety.',
      ['Rust gives strong safety guarantees', 'Free under MIT or Apache', 'Fast entity-component design', 'Targets desktop, web and mobile', 'Very active community'],
      ['Still before version 1.0, so updates can break your code', 'Rust is hard to learn', 'Code-first, with limited editor tools', 'No console target listed', 'Fewer ready-made assets'], 'https://bevy.org/learn/')),
    eng(G_CODE, ['pc', 'web', 'mobile'], o('raylib', 'raylib', 'A simple C library for games with no external dependencies, and bindings for many languages.',
      ['A small, readable C API', 'zlib license', 'No external dependencies', 'Very easy to learn', 'Exports to desktop, web and Android'],
      ['iOS isn\'t listed as a target', 'No editor', 'You build your own engine features', 'No console target', 'Slower to finish a large game'], 'https://www.raylib.com/')),
    eng(G_CODE, ALL, o('sdl', 'SDL', 'The long-established C library for windows, input, audio and graphics, used by many commercial games.',
      ['Used widely in commercial games', 'zlib license', 'Works directly from C and C++', 'Runs on nearly every platform', 'Console builds exist, under NDA'],
      ['Console versions need a separate NDA', 'Low-level, so you build your own engine', 'No editor', 'Far slower to finish a game', 'Easy to spend all your time on the engine'], 'https://wiki.libsdl.org/SDL3/FrontPage')),
    eng(G_CODE, ['pc', 'mobile'], o('sfml', 'SFML', 'A friendly C++ library for 2D graphics, audio and input.',
      ['Clean, modern C++ design', 'zlib license', 'Good for learning', 'Easier than SDL for simple 2D', 'Works on Windows, Linux and macOS'],
      ['Android and iOS support has limitations', 'No web or console target', 'No editor', 'You build your own engine features', 'Smaller commercial use than SDL'], 'https://www.sfml-dev.org/documentation/')),

    eng(G_WEB, ['web', 'pc', 'mobile'], o('phaser', 'Phaser', 'A popular JavaScript library for 2D browser games.',
      ['Instant browser play', 'MIT license', 'Designed specifically for 2D games', 'Many examples', 'Works with standard web tools'],
      ['Editor-free unless you add one', 'Lower performance than native', 'Consoles aren\'t practical', 'Desktop and mobile need a wrapper', 'Weak for 3D'], 'https://phaser.io/learn')),
    eng(G_WEB, ['web', 'pc', 'mobile'], o('threejs', 'Three.js', 'The most widely used JavaScript library for 3D in the browser.',
      ['Very large community', 'MIT license', 'Huge number of examples', 'Great for 3D on the web', 'Small to start with'],
      ['A graphics library, not a game engine', 'You add your own physics and game logic', 'Lower performance than native', 'Consoles aren\'t practical', 'Frequent API changes'], 'https://threejs.org/docs/')),
    eng(G_WEB, ['web', 'pc', 'mobile'], o('babylon', 'Babylon.js', 'A full 3D engine for the browser, with physics and game features.',
      ['More game features than Three.js', 'Apache 2.0 license', 'Good TypeScript support', 'Strong documentation', 'Backed by Microsoft'],
      ['Larger download than Three.js', 'Smaller community than Three.js', 'Lower performance than native', 'Consoles aren\'t practical', 'Few commercial games to learn from'], 'https://doc.babylonjs.com/')),
    eng(G_WEB, ['web', 'pc', 'mobile'], o('playcanvas', 'PlayCanvas', 'A browser-based editor and open-source engine for 3D web games.',
      ['Visual editor in the browser', 'Engine is MIT-licensed', 'Free plan with free hosting', 'Very small builds', 'Team editing'],
      ['Free projects are public', 'Private projects need a paid plan', 'Editor itself is a hosted service', 'Consoles aren\'t practical', 'Smaller community'], 'https://developer.playcanvas.com/'))
  ];

  var MULTIPLAYER = [
    o('single', 'Single-player only', 'No online play.',
      ['By far the simplest option', 'No servers to pay for', 'No cheating problem', 'Works offline', 'You can finish it sooner'],
      ['Harder to build a community', 'Adding multiplayer later is difficult', 'No network effect', 'Replay depends on content', 'Less suited to live-service income'], null, true),
    o('p2p', 'Peer-to-peer or relay', 'Players connect to each other, often through a relay such as Steam Networking.',
      ['Low server cost', 'Good for co-op with friends', 'Engines and stores offer tools', 'Quicker than dedicated servers', 'Scales with players'],
      ['Easier to cheat', 'Depends on the host player\'s connection', 'Host leaving needs handling', 'Network address problems need relays', 'Poor fit for competitive games'], 'https://partner.steamgames.com/doc/features/multiplayer'),
    o('async', 'Turn-based or asynchronous', 'Players act in turns or compare scores through a simple backend.',
      ['Simple request-and-response networking', 'Tolerates slow connections', 'Low server cost', 'Server can validate each move', 'A good first online project'],
      ['Not for action games', 'Needs accounts and storage', 'Notifications add work', 'Players may drop out mid-game', 'Live feel is limited'], null),
    o('dedicated', 'Dedicated real-time servers', 'Your servers run the authoritative game simulation.',
      ['Strongest protection against cheating', 'Fair for competitive play', 'Reliable sessions', 'Supports large matches', 'You control everything'],
      ['Most complex choice', 'Server costs grow with players', 'Needs regions and matchmaking', 'Lag compensation is hard', 'Ongoing operations work'], 'https://agones.dev/site/docs/')
  ];
  var GAME_BACKEND = [
    o('nakama', 'Nakama', 'An open-source game server for accounts, matchmaking and leaderboards.',
      ['Open source and self-hostable', 'Many game features included', 'Works with Unity, Unreal and Godot', 'Custom logic supported', 'Paid hosting available'],
      ['You run it unless you pay', 'Docker is the usual setup, though native binaries exist', 'Needs a PostgreSQL-compatible database', 'Smaller community', 'Custom logic uses its own APIs'], 'https://heroiclabs.com/docs/', true),
    o('playfab', 'PlayFab', 'Microsoft\'s hosted game backend.',
      ['Nothing to host', 'Many live-service features', 'Scales well', 'Works with major engines', 'Free development tier for up to 1,000 lifetime players per title'],
      ['Free tier was cut heavily in 2026', 'Costs grow with players', 'Vendor lock-in', 'Large product to learn', 'Tied to Microsoft', 'Less control'], 'https://learn.microsoft.com/en-us/gaming/playfab/'),
    o('steamworks', 'Platform services', 'Use Steamworks, Game Center or Google Play Games for leaderboards and accounts.',
      ['No server to run', 'Free with the platform', 'Players already have accounts', 'Integrated achievements', 'Very quick for basic features'],
      ['Tied to one platform', 'Cross-platform play is difficult', 'Limited custom logic', 'Each platform differs', 'Your data lives elsewhere'], 'https://partner.steamgames.com/doc/home'),
    o('custom', 'Custom backend', 'Write your own server. This adds a backend language, database and hosting.',
      ['Complete control', 'Use any language you like', 'Fits your exact game', 'No vendor lock-in', 'Teaches backend skills'],
      ['Most work', 'You build accounts and security', 'You run servers', 'Slower to reach players', 'Ongoing maintenance'], null)
  ];
  var DISTRIBUTION = [
    o('steam', 'Steam', 'The main PC game store.',
      ['Largest PC audience', 'Handles payments and updates', 'Community features and reviews', 'Wishlists help marketing', 'Good developer tools'],
      ['Fee per game and a revenue share', 'Crowded, so visibility is hard', 'PC focused', 'Store page needs real preparation', 'Refund rules apply'], 'https://partner.steamgames.com/doc/home', true),
    o('itch', 'itch.io', 'An open store popular for indie games and game jams.',
      ['Free to publish', 'You choose the revenue share', 'Great for browser builds', 'Friendly indie community', 'Very quick to launch'],
      ['Much smaller audience', 'Little discovery', 'Fewer platform features', 'Less sales potential', 'You handle marketing'], 'https://itch.io/docs/creators/getting-started'),
    o('app-stores', 'App Store and Google Play', 'The official mobile stores.',
      ['Reach nearly all mobile users', 'Built-in payments', 'Automatic updates', 'Users trust the stores', 'Featuring can be powerful'],
      ['Developer fees and a revenue share that varies by region', 'Review can delay or reject releases', 'iOS needs a Mac for builds', 'Rule changes affect you', 'Very hard to get discovered'], 'https://developer.apple.com/programs/'),
    o('own-site', 'Your own website', 'Host the game or sell it directly.',
      ['Keep more of the revenue', 'Full control of your page', 'Direct contact with players', 'No store rules', 'Great for browser games'],
      ['You must bring all of the traffic', 'You handle payments and tax', 'You handle hosting and updates', 'Antivirus warnings can scare players of downloads', 'No store trust'], null),
    o('console-stores', 'Console stores', 'PlayStation Store, Xbox and Nintendo eShop. Consoles only sell through these.',
      ['The only official route to console players', 'Dedicated, paying audience', 'Stores handle payments', 'Featuring can be powerful', 'Fixed hardware to certify against'],
      ['Needs approval as a developer', 'Certification for every release', 'Dev kits and NDAs', 'Revenue share applies', 'Each console has its own process'], 'https://www.xbox.com/en-US/developers/id')
  ];

  var LANGUAGE = [
    o('java', 'Java', 'Strongly typed and compiled to JVM bytecode, with a very mature server ecosystem.',
      ['Mature and very stable', 'Huge ecosystem and job market', 'Excellent performance and tooling', 'Stable long-term support releases', 'Frameworks cover almost any need'],
      ['More verbose than most alternatives', 'Higher memory use', 'Slower startup without native builds', 'Frameworks have much to learn', 'Less common for frontend sharing'], 'https://dev.java/learn/', true),
    o('csharp', 'C#', 'A strongly typed language running on .NET, on Windows, Linux and macOS.',
      ['Excellent language design', 'Very high performance with ASP.NET Core', 'Great tooling', 'Same language as Unity and Godot scripting', 'Strong long-term support releases'],
      ['Ecosystem leans toward Microsoft', 'Fewer open-source choices than Java or Node', 'Some paid libraries in the ecosystem', 'Less common in startups in some regions', 'Fast release pace to track'], 'https://learn.microsoft.com/en-us/dotnet/csharp/'),
    o('typescript', 'TypeScript', 'JavaScript with types, running on Node. Frontend and backend can share one language.',
      ['Same language in frontend and backend', 'Huge package ecosystem', 'Fast to develop in', 'Easy to host almost anywhere', 'Very common for web work'],
      ['Types vanish at runtime', 'Package quality varies', 'CPU-heavy work is weak', 'Tooling and frameworks change quickly', 'Dependency trees get large'], 'https://www.typescriptlang.org/docs/'),
    o('python', 'Python', 'A readable, dynamic language with strong web and data libraries.',
      ['Very quick to write', 'Easy to read', 'Django includes a lot', 'Excellent data and AI libraries', 'Huge community and learning material'],
      ['Slower than the others here', 'Dynamic types catch fewer errors early', 'Concurrency is more limited, though optional free-threading is improving', 'Packaging has several competing tools', 'Higher hosting cost under heavy load'], 'https://docs.python.org/3/tutorial/'),
    o('go', 'Go', 'A small, compiled language that produces a single binary.',
      ['Simple language with little to learn', 'Single binary is easy to deploy', 'Excellent concurrency', 'Fast startup and low memory', 'Strong standard library for servers'],
      ['More manual error handling', 'Fewer batteries-included frameworks', 'Smaller web ecosystem', 'Less expressive for business logic', 'You assemble more parts yourself'], 'https://go.dev/doc/')
  ];

  var FRAMEWORKS = {
    csharp: [
      o('aspnet-api', 'ASP.NET Core minimal APIs', 'Small HTTP endpoints with very little setup.',
        ['Very little code to start', 'Excellent performance', 'Built into .NET', 'Great for APIs', 'Good dependency injection built in'],
        ['Less structure as apps grow', 'No built-in server pages', 'You choose your organization', 'Some older tutorials use controllers', 'Fewer conventions for teams'], 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis', true),
      o('aspnet-mvc', 'ASP.NET Core MVC', 'Controllers and server-rendered Razor views.',
        ['Clear structure', 'Server pages and APIs together', 'Very mature', 'Common pattern across many frameworks', 'Works well with ASP.NET Core Identity'],
        ['More files and ceremony', 'Interactive pages need extra tools', 'Less trendy', 'Conventions take learning', 'More code than minimal APIs'], 'https://learn.microsoft.com/en-us/aspnet/core/mvc/overview'),
      o('blazor', 'Blazor', 'Write interactive web interfaces in C# rather than JavaScript.',
        ['C# across frontend and backend', 'Reusable components', 'Good admin-tool productivity', 'Shared models', 'Backed by Microsoft'],
        ['Smaller ecosystem than React', 'Hosting modes take understanding', 'Larger downloads in WebAssembly mode', 'Server mode needs a live connection', 'Fewer developers know it'], 'https://learn.microsoft.com/en-us/aspnet/core/blazor/')
    ],
    typescript: [
      o('nestjs', 'NestJS', 'A structured backend framework with modules and dependency injection.',
        ['Consistent project structure', 'Clear structure for larger apps', 'Dependency injection included', 'Many official modules', 'Strong TypeScript support'],
        ['Heavier than Express or Fastify', 'Lots of decorators', 'More to learn', 'Abstractions can hide details', 'Slower to start small apps'], 'https://docs.nestjs.com/', true),
      o('fastify', 'Fastify', 'A fast, plugin-based HTTP framework.',
        ['Very fast', 'Built-in schema validation', 'Good plugin system', 'Light to learn', 'Good logging'],
        ['You choose your own structure', 'Smaller ecosystem than Express', 'No built-in data layer', 'More decisions to make', 'Plugin model takes learning'], 'https://fastify.dev/docs/latest/'),
      o('express', 'Express', 'The original minimal Node web framework.',
        ['Extremely common', 'Very simple', 'Huge middleware ecosystem', 'Many tutorials', 'Easy to hire for'],
        ['Little structure', 'Weak TypeScript story compared with newer frameworks', 'Slower than Fastify', 'Many old tutorials', 'Validation is up to you'], 'https://expressjs.com/'),
      o('nextjs', 'Next.js', 'One React project for frontend pages and server code.',
        ['One project and one language', 'Excellent frontend experience', 'Server rendering included', 'Very large community', 'Quick deployment on many platforms'],
        ['Backend features are limited compared with dedicated frameworks', 'Complex caching behavior', 'Fast-changing APIs', 'Ties your backend to React', 'Long-running work fits poorly'], 'https://nextjs.org/docs')
    ],
    python: [
      o('django', 'Django', 'A batteries-included framework with an ORM, login and an automatic admin.',
        ['Admin interface included', 'Login and permissions included', 'ORM and migrations included', 'Very mature and well documented', 'Fastest route to this kind of app'],
        ['Less flexible outside its conventions', 'Async support is less complete', 'Heavier for tiny APIs', 'Large framework to learn', 'Slower than compiled options'], 'https://docs.djangoproject.com/', true),
      o('fastapi', 'FastAPI', 'A modern API framework built on Python type hints.',
        ['Automatic API documentation', 'Type hints drive validation', 'Good async performance', 'Very pleasant for APIs', 'Quick to learn'],
        ['No built-in admin or login', 'You choose your data tools', 'Younger ecosystem', 'Async adds pitfalls', 'Less suited to server pages'], 'https://fastapi.tiangolo.com/'),
      o('flask', 'Flask', 'A small, flexible web framework.',
        ['Very simple to start', 'Flexible structure', 'Many extensions', 'Long track record', 'Easy to understand'],
        ['You assemble most features', 'Extension quality varies', 'Less structure for larger apps', 'Mostly synchronous', 'More decisions to make'], 'https://flask.palletsprojects.com/')
    ],
    go: [
      o('nethttp', 'Standard library', 'Go\'s built-in net/http package, which now includes method and path routing.',
        ['No dependencies', 'Very stable', 'Teaches how HTTP works', 'High performance', 'Long-term compatibility'],
        ['More code for common tasks', 'No validation or binding', 'You build your own structure', 'Middleware is manual', 'Fewer conveniences'], 'https://pkg.go.dev/net/http', true),
      o('gin', 'Gin', 'A popular HTTP framework with routing, binding and middleware.',
        ['Very widely used', 'Fast', 'Binding and validation built in', 'Many examples', 'Plenty of middleware'],
        ['Its context type spreads through your code', 'Less needed now the standard library has improved', 'Some magic through struct tags', 'Not standard handlers', 'Harder to replace later'], 'https://gin-gonic.com/en/docs/'),
      o('echo', 'Echo', 'A clean HTTP framework with similar features to Gin.',
        ['Clean API', 'Handlers return errors', 'Good middleware set', 'Good documentation', 'Fast'],
        ['Smaller community than Gin', 'Its context spreads through your code', 'Fewer examples', 'Major versions have changed APIs', 'Still another dependency'], 'https://echo.labstack.com/docs')
    ]
  };

  var DATA = {
    csharp: [
      o('efcore', 'Entity Framework Core', 'Microsoft\'s ORM, which maps C# classes to tables.',
        ['Very little code for common work', 'LINQ queries are type-checked', 'Migrations included', 'Excellent .NET integration', 'Very widely used'],
        ['Generated SQL can surprise', 'Performance needs care', 'Change tracking takes learning', 'Complex queries can be awkward', 'Tempting to overuse lazy loading'], 'https://learn.microsoft.com/en-us/ef/core/', true),
      o('dapper', 'Dapper', 'A very small library that maps your SQL to objects.',
        ['Full control of SQL', 'Very fast', 'Easy to learn', 'Little hidden behavior', 'Used heavily in production'],
        ['You write most SQL', 'Errors appear at runtime', 'No migrations', 'No change tracking', 'More repetitive CRUD'], 'https://github.com/DapperLib/Dapper'),
      o('adonet', 'ADO.NET', '.NET\'s low-level database API.',
        ['No extra dependency', 'Maximum control', 'Teaches the fundamentals', 'Fastest possible path', 'Stable for many years'],
        ['Very verbose', 'Mapping by hand', 'Easy to make mistakes', 'No migrations', 'Slow to develop with'], 'https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/')
    ],
    typescript: [
      o('prisma', 'Prisma', 'A schema file generates a fully typed database client.',
        ['Excellent type safety', 'Great developer experience', 'Migrations included', 'Very readable queries', 'Good documentation'],
        ['Adds a generate step', 'Complex SQL can need raw queries', 'Abstraction can hide costs', 'Its own schema language', 'Heavier than query builders'], 'https://www.prisma.io/docs', true),
      o('drizzle', 'Drizzle', 'A lightweight, typed query layer that stays close to SQL.',
        ['Feels like SQL', 'Strong types', 'Small and fast', 'Migration tool available', 'Schema written in TypeScript'],
        ['Younger project', 'SQL Server support is still in beta, so it isn\'t offered with SQL Server here', 'APIs still evolving', 'You need to know SQL', 'Fewer high-level features'], 'https://orm.drizzle.team/docs/overview'),
      o('kysely', 'Kysely', 'A type-safe SQL query builder.',
        ['Excellent query types', 'Very close to SQL', 'Small and predictable', 'Works with several databases', 'No hidden ORM behavior'],
        ['Not an ORM', 'Types need generating or writing', 'Smaller community', 'More code for simple CRUD', 'Migrations are basic'], 'https://kysely.dev/docs/intro'),
      o('typeorm', 'TypeORM', 'A decorator-based ORM for TypeScript.',
        ['Classes map directly to tables', 'Works well with NestJS', 'Handles relationships', 'Mature', 'Several database options'],
        ['Type safety is weaker than Prisma', 'Known rough edges', 'Maintenance has been uneven', 'Generated SQL can surprise', 'Lazy relations take care'], 'https://typeorm.io/')
    ],
    python: [
      o('django-orm', 'Django ORM', 'Included with Django, with models and migrations.',
        ['Included and well integrated', 'Very quick for CRUD', 'Powers the Django admin', 'Migrations are automatic', 'Excellent documentation'],
        ['Only for Django', 'Complex SQL can be awkward', 'Accidental N+1 queries', 'Async support is partial', 'Hides SQL from learners'], 'https://docs.djangoproject.com/en/stable/topics/db/', true),
      o('sqlalchemy', 'SQLAlchemy', 'Python\'s most powerful database toolkit, with an ORM and a query layer.',
        ['Very powerful', 'Works with any framework', 'Both ORM and SQL-level APIs', 'Mature', 'Pairs with Alembic for migrations'],
        ['Steep learning curve', 'Verbose setup', 'Sessions take understanding', 'Two styles in old tutorials', 'More boilerplate than Django'], 'https://docs.sqlalchemy.org/'),
      o('psycopg', 'Plain SQL with psycopg', 'Write SQL directly through the PostgreSQL driver.',
        ['Full control', 'Very little magic', 'Teaches real SQL', 'Fast', 'Few dependencies'],
        ['PostgreSQL only', 'More repetitive', 'Errors appear at runtime', 'Mapping by hand', 'No migrations included'], 'https://www.psycopg.org/psycopg3/docs/')
    ],
    go: [
      o('sqlc', 'sqlc', 'You write SQL, and it generates type-safe Go code at build time.',
        ['Checked against your schema before running', 'Real SQL', 'No runtime reflection', 'Fast generated code', 'Very easy to read'],
        ['Adds a generate step', 'Dynamic queries are harder', 'Must know SQL', 'Not all database features supported', 'Code generation can feel unusual'], 'https://docs.sqlc.dev/', true),
      o('gorm', 'GORM', 'Go\'s best-known ORM.',
        ['Quick for CRUD', 'Handles relationships', 'Very common', 'Auto-migration for prototypes', 'Many plugins'],
        ['Uses a lot of reflection', 'Errors can be easy to miss', 'Generated SQL can surprise', 'Feels less like normal Go', 'Performance needs care'], 'https://gorm.io/docs/'),
      o('database-sql', 'database/sql or pgx', 'Go\'s standard database API, or the PostgreSQL-specific pgx driver.',
        ['No framework', 'Full control', 'Very stable', 'Teaches fundamentals', 'High performance with pgx'],
        ['Verbose scanning of rows', 'Errors appear at runtime', 'No migrations', 'More repetitive', 'Manual query management'], 'https://pkg.go.dev/database/sql'),
      o('ent', 'Ent', 'An entity framework that generates typed Go code from a schema.',
        ['Strongly typed queries', 'Good for complex relationships', 'Code generation avoids reflection', 'Schema as code', 'Backed by Atlas tooling'],
        ['Generates a lot of code', 'More to learn', 'Smaller community than GORM', 'Less SQL control', 'Builds slow as schemas grow'], 'https://entgo.io/docs/getting-started')
    ]
  };

  var FLYWAY_ANY = o('flyway-any', 'Flyway', 'Numbered SQL files, run by a command-line tool. It works with any backend language.',
    ['Very simple numbered-file model', 'Plain SQL is easy to review', 'Works with any language', 'Clear migration history', 'Long track record'],
    ['Needs Java or its bundled runtime', 'Undo migrations need a paid edition', 'SQL is often database-specific', 'Separate tool from your code', 'Applied files shouldn\'t be edited'], 'https://documentation.red-gate.com/flyway');
  var MIGRATIONS = {
    csharp: [
      o('ef-migrations', 'EF Core migrations', 'Generates migration code from your model changes.',
        ['Automatic from your model', 'Included with EF Core', 'Written in C#', 'Good tooling', 'Can produce SQL scripts'],
        ['Only with EF Core', 'Generated changes need review', 'Merges can conflict', 'Renames may need help', 'Hides SQL from learners'], 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/', true),
      o('fluentmigrator', 'FluentMigrator', 'Write migrations as C# classes, without an ORM.',
        ['Works without EF Core', 'Database-independent style', 'Supports rollback', 'Written in C#', 'Mature'],
        ['More code than plain SQL', 'Another library to learn', 'Abstractions can limit features', 'Smaller community', 'Not automatic'], 'https://fluentmigrator.github.io/'),
      o('dbup', 'DbUp', 'A small library that runs SQL scripts in order.',
        ['Plain SQL', 'Very simple', 'Runs from your own app', 'Easy to review', 'Few concepts'],
        ['No rollback', 'Manual scripts', 'Fewer features', 'SQL is database-specific', 'Small community'], 'https://dbup.readthedocs.io/')
    ],
    typescript: [
      o('prisma-migrate', 'Prisma Migrate', 'Generates SQL migrations from your Prisma schema.',
        ['Automatic from the schema', 'Produces reviewable SQL', 'Included with Prisma', 'Good developer workflow', 'Detects drift'],
        ['Only with Prisma', 'Some changes need manual edits', 'Own workflow to learn', 'Renames need care', 'No down migrations by default'], 'https://www.prisma.io/docs/orm/prisma-migrate', true),
      o('drizzle-kit', 'Drizzle Kit', 'Generates SQL migrations from your Drizzle schema.',
        ['Automatic from the schema', 'Plain SQL output', 'Lightweight', 'Good fit for Drizzle', 'Quick to use'],
        ['Only with Drizzle', 'Younger tool', 'Renames ask for input', 'Fewer advanced features', 'Evolving rapidly'], 'https://orm.drizzle.team/docs/kit-overview'),
      o('node-pg-migrate', 'node-pg-migrate', 'Migration files for PostgreSQL, written in JavaScript or SQL.',
        ['Works with any data library', 'Supports up and down', 'Simple', 'Good for PostgreSQL', 'Written in your language'],
        ['PostgreSQL only', 'Manual migrations', 'Smaller community', 'No schema diffing', 'Basic tooling'], 'https://salsita.github.io/node-pg-migrate/'),
      FLYWAY_ANY
    ],
    python: [
      o('django-migrations', 'Django migrations', 'Generated automatically from your Django models.',
        ['Automatic from models', 'Included with Django', 'Supports rollback', 'Handles data migrations', 'Very mature'],
        ['Only with Django', 'Merges can conflict', 'Generated changes need review', 'Large histories slow down tests', 'Hides SQL from learners'], 'https://docs.djangoproject.com/en/stable/topics/migrations/', true),
      o('alembic', 'Alembic', 'The migration tool made for SQLAlchemy.',
        ['Autogenerates from models', 'Supports up and down', 'Very flexible', 'Standard with SQLAlchemy', 'Works with branches'],
        ['Autogenerate misses some changes', 'More setup', 'Python scripts to maintain', 'Learning curve', 'Needs SQLAlchemy models for autogenerate'], 'https://alembic.sqlalchemy.org/')
    ],
    go: [
      o('goose', 'goose', 'Runs SQL or Go migration files in order.',
        ['Plain SQL', 'Can also write Go', 'Simple command-line tool', 'Up and down migrations', 'Can embed in your binary'],
        ['Manual migrations', 'No schema diffing', 'Basic tooling', 'SQL is database-specific', 'Team numbering needs care'], 'https://pressly.github.io/goose/', true),
      o('golang-migrate', 'golang-migrate', 'A widely used migration tool, as both a command and a library.',
        ['Very widely used', 'Many database drivers', 'Works as a library or command', 'Up and down files', 'Simple format'],
        ['Failures can leave a dirty state to fix', 'No schema diffing', 'Manual migrations', 'Two files per change', 'Basic tooling'], 'https://github.com/golang-migrate/migrate'),
      o('atlas', 'Atlas', 'Compares your desired schema to your database and plans the changes.',
        ['Automatic planning from a schema', 'Good checks for risky changes', 'Works with several languages', 'Modern tooling', 'Pairs with Ent'],
        ['More concepts', 'Some features are paid', 'Younger project', 'Own schema language option', 'Heavier than plain files'], 'https://atlasgo.io/docs')
    ]
  };

  var TRANSPORT = [
    o('websocket', 'WebSockets', 'A permanent two-way connection between browser and server.',
      ['True two-way messaging', 'Low latency', 'Supported by all browsers', 'Libraries in every language', 'Good for chat and collaboration'],
      ['Connections use server resources', 'Scaling needs shared messaging', 'Reconnects are your job', 'Proxies can need configuration', 'Harder to test than HTTP'], 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', true),
    o('sse', 'Server-Sent Events', 'The server streams updates over ordinary HTTP. The browser sends with normal requests.',
      ['Very simple', 'Automatic browser reconnection', 'Works with normal HTTP infrastructure', 'Perfect for dashboards and notifications', 'Easy to debug'],
      ['Server to browser only', 'Text only', 'Connection limits on older HTTP', 'Less suited to fast two-way use', 'Long connections need timeout settings'], 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events'),
    o('library', 'SignalR or Socket.IO', 'Libraries on top of WebSockets that add rooms, reconnection and fallbacks. SignalR is for .NET and Socket.IO for Node.',
      ['Reconnection handled', 'Rooms and broadcast built in', 'Quick to build chat features', 'Mature', 'Good client libraries'],
      ['Tied mostly to one backend language', 'Own protocol', 'Scaling still needs a backplane', 'Extra dependency', 'Hides how the connection works'], 'https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction'),
    o('managed', 'Managed service', 'Services such as Ably or Pusher run the real-time connections for you.',
      ['No connection servers to scale', 'Works from any backend', 'Reliable delivery features', 'Global infrastructure', 'Quick to add'],
      ['Costs grow with messages', 'Vendor lock-in', 'Data passes through a third party', 'Less control', 'Depends on another service'], 'https://ably.com/docs')
  ];

  var SQLITE = o('sqlite', 'SQLite', 'A small database that lives in one file inside your app, written in C.',
    ['Nothing to install or run', 'Very fast for one server', 'One file is simple to back up', 'Extremely well tested', 'Great for learning and small sites'],
    ['Only one writer at a time', 'Hard to use across several servers', 'Fewer data types and features', 'Some hosts have no persistent disk', 'Moving to another database later takes work'], 'https://www.sqlite.org/docs.html');
  var SERVER_TEMPLATES = o('server-templates', 'Server-rendered templates with htmx', 'Your backend produces HTML, and htmx updates parts of the page with very little JavaScript.',
    ['Keeps most logic in your backend language', 'One app, one build and one deployment', 'Session login is simple', 'Templates exist for every framework', 'Small amount of JavaScript to maintain'],
    ['Not ideal for very rich browser interactions', 'Offline behavior is difficult', 'Mobile apps can\'t reuse HTML endpoints like an API', 'Fewer ready-made rich components', 'Interaction logic can spread across templates and controllers'], 'https://htmx.org/docs/');
  var OWN_LOGIN = { csharp: ['ASP.NET Core Identity', 'https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity'], typescript: ['Better Auth', 'https://www.better-auth.com/docs/introduction'], python: ['Django auth or a framework library', 'https://docs.djangoproject.com/en/stable/topics/auth/'], go: ['Your own sessions with a library such as scs', 'https://github.com/alexedwards/scs'] };
  var DJANGO_ADMIN = o('django-admin', 'Django admin', 'A complete admin interface generated from your models.',
    ['Included with Django', 'Working in minutes', 'Handles permissions', 'Very mature', 'Customizable'],
    ['Only with Django', 'Looks like an internal tool', 'Complex workflows get awkward', 'Not meant for general users', 'Deep customization fights the framework'], 'https://docs.djangoproject.com/en/stable/ref/contrib/admin/', true);

  // Java text with Spring-specific wording, rewritten for other languages.
  var GENERIC = {
    'Spring Boot manages both drivers': 'Drivers exist for every major language',
    'Spring Boot manages the JDBC driver': 'Good drivers for major languages',
    'Free jOOQ edition doesn\'t support it': 'Licensing can apply to some libraries',
    'Spring Data MongoDB is available': 'Libraries exist for every major language',
    'Rules out JPA, jOOQ and SQL-based migrations': 'Rules out most SQL-based data libraries and migrations',
    'Good practice for learning Spring': 'Good practice for learning your framework',
    'Teaches you little Java or Spring': 'Teaches you little about your framework',
    'Slow JVM startup can matter when scaling from zero': 'Slow startup can matter when scaling from zero',
    'Can call your Spring services directly': 'Can call your services directly',
    'The REST path in Step 8 follows this style.': '',
    'Step 8 shows this style if you choose it': 'Very widely understood',
    'Fits Thymeleaf with htmx': 'Fits server templates with htmx',
    'Spring Boot has a GraphQL starter.': '',
    'Boot 4.1.2 has no <code>spring-boot-starter-grpc</code>, so it needs a separate integration.': '',
    'Your project already uses it': 'Well established'
  };
  function generic(opt) {
    function fix(t) { Object.keys(GENERIC).forEach(function (k) { t = t.split(k).join(GENERIC[k]); }); return t; }
    return Object.assign({}, opt, { sum: fix(opt.sum), pros: opt.pros.map(fix), cons: opt.cons.map(fix) });
  }

  var STAGES = {
    product: 'Product', requirements: 'Requirements', approach: 'Approach', backend: 'Backend',
    interface: 'Interface', data: 'Data', services: 'Services', delivery: 'Delivery'
  };
  var STAGE_ORDER = ['product', 'requirements', 'approach', 'backend', 'interface', 'data', 'services', 'delivery'];

  var PRODUCT = [
    o('website', 'Website', 'Anything people use in a browser, from a simple blog to a store or a live web app.', null, null),
    o('game', 'Game', 'Something people play, on PC, in a browser, on mobile or on consoles.', null, null)
  ];
  var NEEDS = [
    o('accounts', 'User accounts and login', 'People sign in and see their own data.', null, null),
    o('admin', 'Admin area', 'Staff manage users or data. This also needs login.', null, null),
    o('store', 'Sell products', 'A catalog, cart and payments.', null, null),
    o('live', 'Live updates', 'Screens update without reloading, as in chat or live dashboards.', null, null)
  ];

  // Browser libraries only make sense when the browser is a target; other platforms then use a wrapper.
  function engineFits(e, p) {
    if (e.group === G_WEB && p.indexOf('web') < 0) return false;
    return p.every(function (x) { return e.plat.indexOf(x) >= 0; });
  }
  function has(a, need) { return (a.needs || []).indexOf(need) >= 0; }
  function isWeb(a) { return a.product === 'website'; }
  function isGame(a) { return a.product === 'game'; }
  function wantsLogin(a) { return has(a, 'accounts') || has(a, 'admin'); }
  // These needs have no packaged option on this page, unless the site is also a store.
  function forcedCustom(a) { return isWeb(a) && (has(a, 'live') || (wantsLogin(a) && !has(a, 'store'))); }
  function isCustomWeb(a) { return isWeb(a) && !!a.needs && (forcedCustom(a) || a.siteStack === 'custom'); }
  function isGameBackend(a) { return isGame(a) && a.gameBackend === 'custom'; }
  function needsServer(a) { return isCustomWeb(a) || isGameBackend(a); }
  function nonSpring(a) { return a.language === 'java' && !!a.framework && a.framework !== 'spring-boot'; }
  function hasOnline(a) { return isGame(a) && !!a.multiplayer && a.multiplayer !== 'single'; }
  function isStaticStack(a) { return isWeb(a) && !has(a, 'store') && !forcedCustom(a) && ['astro', 'hugo', 'nextjs'].indexOf(a.siteStack) >= 0; }

  // One rule for every suggestion: what works best given the answers so far, then what is easiest to develop with.
  var SERVER_RENDERED = ['django', 'flask', 'aspnet-mvc', 'spring-boot', 'quarkus', 'micronaut', 'jakarta-ee'];
  function isSpa(a) { return ['react', 'vue', 'angular'].indexOf(a.frontend) >= 0; }
  // 2D and 3D fit. Engines that can do both stay listed for every answer.
  var GRAPHICS = [
    o('2d', '2D', 'Sprites and flat scenes, such as platformers, puzzle games and visual novels.',
      ['Fewer systems to learn', 'Art is usually cheaper to make', 'Runs well on weak hardware', 'The widest choice of engines', 'Much easier to finish a first game'],
      ['Animation can take a lot of hand-drawn work', 'Some engines treat it as secondary', 'Camera and depth effects are limited', 'A crowded market', 'Can be hard to change to 3D later'], null),
    o('3d', '3D', 'A full 3D world with a moving camera.',
      ['Free camera and real depth', 'Models can be reused across animations', 'Strong tools in the major engines', 'Suits exploration and first-person games', 'High visual ceiling'],
      ['Far more to learn', 'Models, rigs and animation cost more to make', 'Needs more performance work', 'Harder to run on weak devices', 'Fewer engines suit it'], null),
    o('mixed', 'Both', '3D scenes with 2D parts, or 2D characters in a 3D world.',
      ['A distinctive visual style', 'Can use cheaper 2D art in places', 'Keeps real depth and camera moves', 'Flexible as the game changes', 'Works in the major full engines'],
      ['You need to learn both toolsets', 'Mixing styles takes care to look right', 'Only engines that handle both fit', 'More art pipelines to maintain', 'Harder to find exact tutorials'], null)
  ];
  var DIMS = { godot: 'both', unity: 'both', unreal: 'both', flax: '3d', stride: '3d', o3de: '3d', cocos: 'both', gamemaker: '2d', defold: 'both', construct: '2d', renpy: '2d', libgdx: 'both', monogame: 'both', bevy: 'both', raylib: 'both', sdl: 'both', sfml: '2d', phaser: '2d', threejs: '3d', babylon: '3d', playcanvas: '3d' };
  function graphicsFits(e, g) {
    var d = DIMS[e.id];
    return !g || d === 'both' || d === g;
  }
  var GAME_EXTRAS = [
    o('achievements', 'Achievements or leaderboards', 'Goals and rankings for players to chase.', null, null),
    o('crash', 'Crash reports', 'Find out when and why the game crashes on players\' machines.', null, null),
    o('analytics', 'Player analytics', 'See how people play, such as where they stop.', null, null)
  ];
  function extra(a, x) { return (a.gameExtras || []).indexOf(x) >= 0; }
  function hasNativePlatform(a) { return (a.platforms || []).some(function (p) { return p !== 'web'; }); }
  function hasOwnOnlineData(a) { return ['nakama', 'playfab', 'custom'].indexOf(a.gameBackend) >= 0; }
  function needsStoreFeatures(a) { return a.saves === 'store-cloud' || a.achievements === 'store'; }

  // The game's own language. An engine missing from this table has one main language, named in SINGLE_LANGUAGE.
  var JS_WEB = o('javascript', 'JavaScript', 'The browser\'s own language, with nothing to compile.',
    ['Nothing to set up or compile', 'Runs directly in the browser', 'Every example will work', 'Quick for small experiments', 'Skills apply across the web'],
    ['Errors often appear only when the game runs', 'Editors can\'t help as much', 'Refactoring large code is risky', 'Harder to keep larger projects organized', 'Engine APIs are harder to explore without types'], null);
  var TS_WEB = o('typescript', 'TypeScript', 'JavaScript with types, which catches many errors before the game runs.',
    ['Catches many errors while you type', 'Strong autocomplete for engine APIs', 'Safer to refactor', 'Keeps larger games organized', 'Compiles to JavaScript that runs everywhere'],
    ['Needs a build step', 'More to learn at first', 'Types can be fiddly around some libraries', 'Some examples are JavaScript only', 'Slower to start a tiny experiment'], null);
  var SCRIPTING = {
    godot: [
      o('gdscript', 'GDScript', 'Godot\'s own language, with a simple Python-like style.',
        ['Godot\'s docs recommend it for beginners', 'Built for Godot and tightly tied into the editor', 'Compiles and loads quickly', 'Exports everywhere Godot does', 'Built-in types for vectors and transforms'],
        ['Runs more slowly than compiled C# or C++', 'Little use outside Godot', 'Fewer third-party libraries', 'Optional typing can leave errors until runtime', 'Very heavy logic may need moving to C++'], null),
      o('csharp', 'C#', 'A mature general-purpose language, which needs the .NET edition of Godot.',
        ['Mature, with many libraries', 'A good balance of speed and ease', 'Skills carry over to Unity and .NET', 'Strong code editors and debuggers', 'Can share code with a C# server'],
        ['No web export in Godot 4', 'Android and iOS support is experimental', 'Needs the .NET editor, the .NET SDK and an external code editor', 'Fewer learning resources than GDScript', 'Its garbage collector needs some care'], null),
      o('cpp', 'C++ through GDExtension', 'The best performance in Godot, without rebuilding the engine.',
        ['The best performance Godot offers', 'No need to recompile Godot', 'Works with any compiler', 'Can be mixed with GDScript for just the slow parts', 'API closely matches Godot\'s own C++'],
        ['Slower to iterate because every change compiles', 'Memory mistakes can crash the game', 'Much harder for beginners', 'Needs a build for each platform', 'Fewer tutorials'], null)
    ],
    unreal: [
      o('blueprints', 'Blueprints', 'Unreal\'s visual scripting, with most engine features available from the start.',
        ['No compiling for most changes', 'Very quick for prototypes', 'Designers can work with it', 'Most gameplay features are exposed', 'Many tutorials use it'],
        ['Slower than C++ for heavy logic', 'Large graphs get hard to read', 'Binary assets are hard to merge in Git', 'Not everything in the engine is exposed', 'Larger games usually add C++ later'], null),
      o('cpp', 'C++', 'Unreal\'s native language, with full access to the engine.',
        ['Full access to the engine', 'The best performance', 'Scales well on large projects', 'Works well with text-based version control', 'Can expose your code to Blueprints'],
        ['Long compile times', 'Unreal\'s own C++ style takes time to learn', 'Crashes are harder to debug', 'Slow for early prototyping', 'Steep for beginners'], null)
    ],
    flax: [
      o('csharp', 'C#', 'The language most of Flax\'s scripting docs use.',
        ['Most Flax docs use it', 'Quicker to iterate than C++', 'Highly integrated with the editor', 'Skills carry over to other .NET work', 'Strong editors and debuggers'],
        ['Slower than C++ for heavy logic', 'Its garbage collector needs care', 'Fewer Flax examples than Unity has for C#', 'Needs the .NET toolchain', 'Must learn to program first'], null),
      o('cpp', 'C++', 'The language the engine itself is written in.',
        ['The best performance', 'Direct access to the engine', 'Mixes with C# in one project', 'Skills transfer to other engines', 'Good for performance-heavy systems'],
        ['Slower to compile and iterate', 'Fewer docs than C#', 'Memory mistakes can crash the game', 'Harder for beginners', 'More build setup'], null),
      o('visual', 'Visual scripting', 'Flax\'s node graphs, for logic without written code.',
        ['No code needed', 'Quick for simple logic', 'Friendly to non-programmers', 'Mixes with C# and C++', 'Changes are easy to try'],
        ['Few tutorials', 'Large graphs get hard to read', 'Hard to merge in version control', 'Slower than compiled code', 'You will likely want code as the game grows'], null)
    ],
    o3de: [
      o('cpp', 'C++', 'The engine\'s native language, through its Gems system.',
        ['Full access to the engine', 'The best performance', 'Scales to large projects', 'Skills transfer to other engines', 'Works well in text-based version control'],
        ['Long build times', 'Steep learning curve', 'Crashes are harder to debug', 'Few beginner tutorials', 'Slow for early prototyping'], null),
      o('lua', 'Lua', 'A small scripting language attached to objects in your scene.',
        ['Quick to learn', 'Changes without recompiling', 'Small language', 'Good for gameplay logic', 'Mixes with C++'],
        ['Slower than C++', 'Not everything is exposed', 'Few O3DE-specific examples', 'Errors often appear at runtime', 'Weak tooling for large code'], null),
      o('visual', 'Script Canvas', 'O3DE\'s visual scripting graphs.',
        ['No code needed', 'Good for designers', 'Quick to try changes', 'Built into the editor', 'Mixes with C++'],
        ['Few tutorials', 'Large graphs get hard to read', 'Hard to merge in version control', 'Slower than C++', 'Not everything is exposed'], null)
    ],
    gamemaker: [
      o('gml-code', 'GML Code', 'GameMaker\'s written language, and the basis for everything else in it.',
        ['Full power of the engine', 'Simple to learn', 'Most advanced tutorials use it', 'Easier to search and reuse than blocks', 'Works well in version control'],
        ['Little use outside GameMaker', 'You must learn to program', 'Weak typing leaves some errors until runtime', 'Slower to start than blocks for non-coders', 'Fewer general libraries'], null),
      o('gml-visual', 'GML Visual', 'Drag-and-drop action blocks, built on the same language.',
        ['No typing needed', 'Very friendly for a first game', 'Teaches how game logic flows', 'Can mix with GML Code', 'Quick for small games'],
        ['Slower to work with as the game grows', 'Large block lists get hard to read', 'Fewer advanced tutorials', 'Harder to review changes', 'You will likely move to GML Code'], null)
    ],
    construct: [
      o('events', 'Event sheets', 'Construct\'s visual rules, written as conditions and actions.',
        ['No programming needed', 'Very quick for prototypes', 'Most tutorials use them', 'Easy to read for small games', 'Built into the editor'],
        ['Teaches you little general programming', 'Large sheets get hard to manage', 'Skills don\'t carry to other engines', 'Hard to review in version control', 'Complex algorithms are awkward'], null),
      o('typescript', 'TypeScript or JavaScript', 'Write code alongside or instead of event sheets.',
        ['General skills that carry over', 'Suits complex logic', 'Can be mixed with event sheets', 'Types catch errors early in TypeScript', 'Can use existing libraries'],
        ['Fewer tutorials than event sheets', 'You must learn to program', 'Gives up Construct\'s main selling point', 'Needs Construct\'s scripting API too', 'Slower for very simple rules'], null)
    ],
    libgdx: [
      o('java', 'Java', 'libGDX\'s main language, used by its docs and examples.',
        ['All docs and examples work', 'Mature tools and debuggers', 'Supports the standard web target', 'Skills carry over to backend work', 'Very large library ecosystem'],
        ['More verbose than Kotlin', 'Null errors only show at runtime', 'Its garbage collector needs care', 'Modern language features vary by target', 'Less concise for game logic'], null),
      o('kotlin', 'Kotlin', 'A modern JVM language that works with libGDX.',
        ['Much less boilerplate', 'Safer handling of null values', 'Works with Java libraries', 'Strong support in IntelliJ IDEA', 'Good libraries such as KTX'],
        ['Can\'t use the standard GWT web target', 'Most examples are in Java', 'Slightly longer builds', 'Smaller game community', 'More to learn if you only know Java'], null)
    ],
    sdl: [
      o('cpp', 'C++', 'SDL\'s C API, used from C++ with classes and the standard library.',
        ['The standard library saves work', 'Classes help organize larger games', 'Common in commercial games', 'Works directly with SDL\'s C API', 'Many game programming books use it'],
        ['Long compile times on larger projects', 'A very large language', 'Memory mistakes can crash the game', 'Hard for beginners', 'Slow to reach a finished game'], null),
      o('c', 'C', 'SDL\'s native language, small and simple.',
        ['All SDL examples work directly', 'A small language', 'Very fast compile times', 'You see exactly what the code does', 'Runs anywhere SDL does'],
        ['You write your own containers and strings', 'Memory mistakes can crash the game', 'Harder to organize large games', 'Fewer safety checks', 'Slow to reach a finished game'], null)
    ]
  };
  ['cocos', 'phaser', 'threejs', 'babylon'].forEach(function (id) { SCRIPTING[id] = [TS_WEB, JS_WEB]; });
  var SINGLE_LANGUAGE = { unity: 'C#', stride: 'C#', defold: 'Lua', renpy: 'Ren\'Py script, with optional Python', monogame: 'C#', bevy: 'Rust', raylib: 'C, with bindings for many other languages', sfml: 'C++', playcanvas: 'JavaScript' };
  function scriptingOptions(a) {
    var e = ENGINE.filter(function (x) { return x.id === a.engine; })[0];
    var web = (a.platforms || []).indexOf('web') >= 0;
    return (SCRIPTING[a.engine] || []).filter(function (s) {
      if (a.engine === 'godot' && s.id === 'csharp' && web) return false;
      if (a.engine === 'libgdx' && s.id === 'kotlin' && web) return false;
      return true;
    }).map(function (s) { return Object.assign({}, s, { url: s.url || (e && e.url) }); });
  }

  var SAVES = [
    o('none', 'No saved games', 'Each session starts fresh, as in many arcade and party games.',
      ['Nothing to build', 'Nothing can go wrong or be corrupted', 'No save format to keep compatible', 'No storage or privacy concerns', 'Fastest to ship'],
      ['Only suits short-session games', 'Players lose all progress when they quit', 'Settings still need storing somewhere', 'Hard to add later if the game grows', 'Rules out long-term progression'], null),
    o('local', 'Save on the player\'s device', 'Your game writes files through the engine\'s own save features.',
      ['No service or cost', 'Works offline', 'Simple to build and test', 'Every engine can do it', 'Players keep their own data'],
      ['Progress doesn\'t follow players between devices', 'Lost if the device is lost', 'Players can edit the files', 'Browser storage can be cleared', 'Old saves must keep working after updates'], null),
    o('store-cloud', 'Store cloud saves', 'Steam Cloud, iCloud or Google Play Games keep copies of the player\'s saves.',
      ['Progress follows the player', 'No server of your own', 'Steam Cloud can copy files with no game code', 'Players already have the accounts', 'Handled by a company players trust'],
      ['Each store works differently', 'Doesn\'t carry between different stores', 'Conflicts between devices need handling', 'Rules out stores without it, such as itch.io', 'Storage limits apply'], 'https://partner.steamgames.com/doc/features/cloud'),
    o('backend', 'Save on your online backend', 'Your online service stores each player\'s progress.',
      ['Works across every platform', 'Harder for players to cheat', 'You can fix or restore saves', 'Uses the backend you already chose', 'Lets you change data between sessions'],
      ['Players need a connection and an account', 'Adds to your running costs', 'You are responsible for the data', 'Privacy laws apply', 'Needs offline and conflict handling'], null)
  ];
  var ACHIEVEMENTS = [
    o('store', 'The store\'s own system', 'Steam, Game Center, Google Play Games or the console\'s system.',
      ['Players see them in a place they know', 'No server to run', 'Built-in overlays and friend lists', 'Free with the platform', 'Consoles usually expect it'],
      ['Set up separately for each store', 'No shared rankings between stores', 'Rules out stores without it, such as itch.io', 'Limited custom rules', 'Your engine may need a plugin'], 'https://partner.steamgames.com/doc/features/achievements'),
    o('backend', 'Your online backend', 'Nakama, PlayFab or your own server keeps the rankings and progress.',
      ['One system on every platform', 'Rankings shared across stores', 'Custom rules and seasons', 'You own the data', 'Harder to cheat'],
      ['More to build than the store\'s system', 'Doesn\'t appear in the store\'s overlay', 'Needs a connection', 'Adds to server costs', 'On Nakama, achievements come from its Hiro toolkit, so check its pricing'], null),
    o('own', 'Inside the game only', 'Your game tracks its own goals and shows them in its menus.',
      ['No service or SDK', 'Works offline', 'Works with every store', 'Complete control of the design', 'Simple to build'],
      ['No shared rankings', 'Players can edit local data', 'No store profile or overlay', 'Lost if saves are lost', 'You build all the screens'], null)
  ];
  var SENTRY_ENGINES = ['godot', 'unity', 'unreal', 'sdl', 'raylib', 'sfml', 'o3de', 'monogame', 'stride', 'flax', 'libgdx', 'phaser', 'threejs', 'babylon', 'playcanvas', 'cocos', 'bevy'];
  var CRASH = [
    o('sentry', 'Sentry', 'Error and crash reporting, with SDKs for Godot, Unity, Unreal and many languages.',
      ['Dedicated SDKs for Godot, Unity and Unreal', 'Also covers PlayStation, Xbox and Switch', 'Shows stack traces and releases', 'Very widely used beyond games', 'Language SDKs cover many other engines'],
      ['Other engines use a general language SDK', 'Costs grow with event volume, so check its pricing', 'You must ask for consent where the law requires it', 'Native builds need debug symbols uploaded', 'Console SDKs need platform access'], 'https://docs.sentry.io/platforms/'),
    o('crashlytics', 'Firebase Crashlytics', 'Google\'s crash reporting for mobile apps, with a Unity SDK.',
      ['Official Unity SDK', 'Strong on Android and iOS', 'Fits with other Firebase services', 'Simple dashboards', 'Groups similar crashes together'],
      ['Mobile only', 'No desktop or console reports', 'Tied to Google', 'Needs Firebase set up in your project', 'You still need another tool for other platforms'], 'https://firebase.google.com/docs/crashlytics'),
    o('own', 'Log files', 'Your game writes a log that players can send you.',
      ['No service or SDK', 'No privacy concerns from automatic sending', 'Works on every engine', 'Nothing to pay for', 'Simple to build'],
      ['You only hear about crashes players report', 'Hard to see patterns', 'A hard crash may not write the log', 'Asks players to do work', 'Hard to tell how common a problem is'], null)
  ];
  var FIREBASE_ENGINES = ['unity', 'sdl', 'raylib', 'sfml', 'phaser', 'threejs', 'babylon', 'playcanvas', 'cocos'];
  var ANALYTICS = [
    o('gameanalytics', 'GameAnalytics', 'Analytics built for games, with SDKs for many engines.',
      ['Designed around game metrics', 'SDKs for Unity, Unreal, Godot, Defold, Construct and more', 'Collection API for other engines', 'Ready-made dashboards', 'Quick to start'],
      ['Check its current pricing and limits', 'Engines without an SDK need more work', 'You must ask for consent where the law requires it', 'Less flexible than your own data', 'Your data sits with a third party'], 'https://docs.gameanalytics.com/'),
    o('unity-analytics', 'Unity Analytics', 'Unity\'s own analytics, inside its cloud services.',
      ['Made for Unity', 'Ties into Unity\'s other services', 'One account and dashboard', 'Quick to add', 'Maintained by the engine\'s vendor'],
      ['Unity only', 'Deepens your reliance on Unity', 'Check its current pricing', 'Hard to move later', 'You must ask for consent where the law requires it'], 'https://docs.unity.com/en-us/analytics'),
    o('firebase', 'Google Analytics for Firebase', 'Free analytics from Google, for mobile and web.',
      ['Available at no charge', 'SDKs for Unity, C++, iOS, Android and web', 'Works with other Firebase services', 'Strong on mobile', 'Large community'],
      ['Not designed around game metrics', 'Tied to Google', 'Weak for desktop and consoles', 'Needs Firebase set up in your project', 'You must ask for consent where the law requires it'], 'https://firebase.google.com/docs/analytics'),
    o('own-backend', 'Events to your own backend', 'Your server records what players do.',
      ['You own all the data', 'Exactly the events you want', 'No third-party SDK', 'Uses the server you already have', 'Can link events to accounts'],
      ['You build the charts', 'Adds server load and storage', 'Easy to collect data you never use', 'Privacy rules are your job', 'Takes time from the game itself'], null),
    o('store-stats', 'Store reports only', 'Use the sales and player numbers your store already gives you.',
      ['Nothing to add to the game', 'No consent screens for this', 'Nothing to pay for', 'Enough for many small games', 'Nothing to maintain'],
      ['Doesn\'t show what happens inside the game', 'Can\'t show where players stop', 'Different reports for each store', 'Your own website gives you none of this', 'Slow feedback on design changes'], null)
  ];
  var SERVICE_HOST = [
    o('vps', 'A single server with Docker', 'Rent one server and run Nakama and its database on it.',
      ['The cheapest way to start', 'Docker is Nakama\'s quickest install', 'Simple to understand', 'Full control', 'Easy to move later'],
      ['You handle updates and security', 'You handle backups', 'One server can fail and take the game down', 'Scaling takes work', 'Someone must respond to outages'], 'https://heroiclabs.com/docs/nakama/getting-started/install/'),
    o('containers', 'Managed containers', 'A cloud service runs the Nakama container, with a managed database.',
      ['Restarts and scaling are easier', 'Managed database backups', 'Repeatable deployments', 'No single machine to look after', 'Available from every major cloud'],
      ['Costs more than one server', 'More cloud concepts to learn', 'You still handle Nakama updates', 'Real-time connections need careful setup', 'Harder to debug'], 'https://heroiclabs.com/docs/nakama/getting-started/install/'),
    o('heroic-cloud', 'Heroic Cloud', 'Managed hosting from the company behind Nakama.',
      ['Run by the people who build Nakama', 'Includes the database, load balancers and DNS', 'Automated database backups', 'Built to scale to many servers', 'Enterprise licenses are bundled'],
      ['Check its pricing, because the page shows no figures', 'Costs more than running it yourself', 'Depends on one vendor', 'Aimed at larger games', 'Less control over the servers'], 'https://heroiclabs.com/heroic-cloud/')
  ];

  var SUGGEST = {
    frontendLanguage: function () { return ['typescript', 'It is what most new React and Vue projects use, and types catch many mistakes before the code runs. It costs little to adopt.']; },
    graphics: function () { return ['2d', 'It has far less to learn and costs less to make art for, so it gives you the best chance of finishing. Choose 3D if the game doesn\'t work without it.']; },
    scripting: function (a) {
      var pick = {
        godot: ['gdscript', 'Godot\'s docs recommend it for beginners, and it exports to every platform Godot supports. Use C++ later for any part that is too slow.'],
        unreal: ['blueprints', 'Most changes need no compile, so it is the easiest way to get a game working. Add C++ later for anything too slow.'],
        flax: ['csharp', 'Most of the Flax docs use it, and it is much quicker to iterate in than C++.'],
        o3de: ['lua', 'It lets you change gameplay without long rebuilds. Move to C++ for anything too slow.'],
        gamemaker: ['gml-code', 'It is simple to learn, has the full power of the engine, and is easier to manage as the game grows.'],
        construct: ['events', 'It is what Construct is designed around, and what most of its tutorials use.'],
        libgdx: [(a.platforms || []).indexOf('web') >= 0 ? 'java' : 'kotlin', (a.platforms || []).indexOf('web') >= 0 ? 'It works with the standard web target, and all the docs and examples use it.' : 'It removes a lot of boilerplate and works with every Java library. Choose Java if you want the examples to work as written.'],
        sdl: ['cpp', 'The standard library saves a lot of work and helps organize a game as it grows.']
      }[a.engine];
      return pick || ['typescript', 'It catches many errors while you type and makes engine APIs easier to explore. Choose JavaScript for a very small experiment.'];
    },
    saves: function (a) {
      if (hasOwnOnlineData(a)) return ['backend', 'You already have a backend with player accounts, and it keeps progress the same on every platform.'];
      return ['local', 'Every engine can do it, it works offline and it needs no service. Add store cloud saves later if players ask.'];
    },
    achievements: function (a) {
      if (hasNativePlatform(a)) return ['store', 'Players already use these systems, and you run no server. Choose your backend if you need rankings shared across stores.'];
      return ['backend', 'It works in the browser and already holds your player accounts.'];
    },
    crash: function () { return ['sentry', 'It has the widest engine and language coverage here, and it handles both native crashes and script errors.']; },
    analytics: function (a) {
      if (a.engine === 'unity') return ['unity-analytics', 'It is made for your engine and quick to add. Choose GameAnalytics if you want game dashboards that don\'t tie you further to Unity.'];
      return ['gameanalytics', 'It is designed around game metrics and has ready-made dashboards, so you can start without building your own.'];
    },
    serviceHost: function () { return ['vps', 'It is the cheapest way to start, and Docker is the quickest Nakama install. Move to managed containers or Heroic Cloud when players depend on it being up.']; },
    platforms: function () { return ['pc', 'You build and test on the same machine, so it is the easiest target by far. Most engines let you add other platforms later.']; },
    multiplayer: function () { return ['single', 'It has no servers to run, no cheating to handle and no network code to debug. Choose online play only if the game doesn\'t work without it.']; },
    siteStack: function (a) {
      if (has(a, 'store')) return ['shopify', 'It handles payments, tax, hosting and security, which are the hardest parts of a store. Choose a custom backend only if your business rules don\'t fit a platform.'];
      return ['astro', 'It produces fast pages by default and is simple to write content in. Choose WordPress instead if non-technical people will publish without a developer.'];
    },
    contentSource: function () { return ['git', 'It is free and needs nothing extra to run. Choose a hosted CMS if people who don\'t use Git will edit the site.']; },
    engine: function (a) {
      var p = a.platforms || [], has3 = function (x) { return p.indexOf(x) >= 0; };
      if (has3('console')) return ['unity', 'It has official console support and the most tutorials and assets, which makes it the easiest proven route to consoles. Consoles still need approval from each manufacturer.'];
      if (p.length === 1 && has3('web') && a.graphics === '3d') return ['babylon', 'It is a full 3D engine for the browser, with physics and game features built in, so you write less yourself.'];
      if (p.length === 1 && has3('web') && a.graphics === '2d') return ['phaser', 'It is built for 2D browser games and needs no editor or install.'];
      if (has3('web')) return ['godot', 'One free project can export to all of these, and its built-in language is quick to learn. Use its own language rather than C#, because C# has no official web export yet.'];
      if (has3('mobile')) return ['unity', 'It has strong mobile tooling and the most tutorials and assets, so most problems you hit already have an answer.'];
      if (a.graphics === '2d') return ['godot', 'It is free, quick to learn and fast to iterate in, with dedicated 2D tools.'];
      return ['godot', 'It is free, quick to learn and fast to iterate in, and handles smaller 3D games well. Choose Unreal if top-end 3D graphics are the point of the game.'];
    },
    gameBackend: function (a) {
      if (a.multiplayer === 'p2p' && (a.platforms || []).indexOf('pc') >= 0) return ['steamworks', 'It adds invites, lobbies and relays with no server to run. Choose Nakama if you need cross-platform play.'];
      return ['nakama', 'It already has accounts, matchmaking and leaderboards, and it is open source, so you can host it yourself.'];
    },
    language: function (a) {
      if (isGame(a)) {
        if (a.scripting === 'csharp' || ['unity', 'stride', 'monogame'].indexOf(a.engine) >= 0) return ['csharp', 'Your game uses C#, so client and server can share one language and some code.'];
        return ['typescript', 'It is quick to write, has libraries for most game backend needs, and is easy to host.'];
      }
      if (has(a, 'live')) return ['typescript', 'Node handles many open connections well, and frontend and backend can share one language and types.'];
      return ['python', 'Django includes login, an admin area, an ORM and migrations, so it needs the least code for this kind of site.'];
    },
    framework: function (a) {
      if (a.language === 'java') return ['spring-boot', 'It has the largest ecosystem and the most documentation, so most problems you hit already have an answer.'];
      if (a.language === 'csharp') return isGame(a) ? ['aspnet-api', 'It needs very little code for an API and performs very well.'] : ['aspnet-mvc', 'It gives you a clear structure, with server pages and APIs in one framework.'];
      if (a.language === 'typescript') return (isGame(a) || has(a, 'live')) ? ['nestjs', 'It handles long-running connections better than Next.js, and its structure holds up as the code grows.'] : ['nextjs', 'One project covers both pages and server code, so there is less to set up and deploy.'];
      if (a.language === 'python') return isGame(a) ? ['fastapi', 'It is quick to write, has good async performance and documents your API automatically.'] : ['django', 'It includes login, an admin area, an ORM and migrations, so you write the least code.'];
      return ['gin', 'It adds request binding, validation and middleware to the standard library, and has the most examples.'];
    },
    build: function () { return ['maven', 'Its fixed structure means there is little to configure, and nearly every Java tutorial covers it. Gradle is a good alternative if builds become slow or need custom logic.']; },
    frontend: function (a) {
      if (a.framework === 'nextjs') return ['react', 'Next.js is built on React.'];
      var spring = a.framework === 'spring-boot';
      if (!has(a, 'live') && SERVER_RENDERED.indexOf(a.framework) >= 0) return [spring ? 'thymeleaf' : 'server-templates', 'Your framework renders pages well, so you avoid a second project, build and language. Choose React if the interface needs to feel like a desktop app.'];
      return ['react', 'It has the largest ecosystem of components and answers. Live or API-driven interfaces fit it well.'];
    },
    api: function (a) {
      if (a.framework === 'blazor' || (a.frontend && !isSpa(a) && a.framework !== 'nextjs')) return ['server', 'Your backend renders the pages, so you have no API contract to design or keep in sync. Add REST later if another client needs your data.'];
      return ['rest', 'Every client and tool understands it, and it is the simplest fit for a separate frontend.'];
    },
    transport: function (a) {
      if (a.language === 'csharp' || a.language === 'typescript') return ['library', 'Reconnection, rooms and broadcasting are already built, and these are the parts that are hardest to get right yourself.'];
      return ['websocket', 'It is supported everywhere and handles two-way messages. Use Server-Sent Events instead if updates only flow to the browser, because they are simpler.'];
    },
    database: function () { return ['postgresql', 'It suits most apps, keeps your data consistent, and is offered by almost every host. Choose something else only for a specific reason.']; },
    data: function (a) {
      if (a.language === 'java') return ['jpa', 'It needs the least code for ordinary create, read, update and delete work. Add jOOQ later if reports become complex.'];
      if (a.language === 'csharp') return ['efcore', 'It needs the least code for ordinary data work, its queries are type-checked, and it includes migrations.'];
      if (a.language === 'typescript') return ['prisma', 'It gives you fully typed queries with very little code, and it includes migrations.'];
      if (a.language === 'python') return a.framework === 'django' ? ['django-orm', 'It comes with Django and powers the Django admin.'] : ['sqlalchemy', 'It is the standard choice outside Django, and it works with Alembic for migrations.'];
      if (a.database === 'sqlserver') return ['gorm', 'It is quick for ordinary data work, and it supports SQL Server.'];
      return ['sqlc', 'You write ordinary SQL, and it generates checked Go code, so mistakes appear before you run anything.'];
    },
    migrations: function (a) {
      if (a.language === 'java') return ['flyway', 'Numbered SQL files are simple to write and easy to review.'];
      if (a.data === 'efcore') return ['ef-migrations', 'It generates migrations from your model, so it needs the least work.'];
      if (a.language === 'csharp') return ['dbup', 'It simply runs your SQL files in order, so there is little to learn.'];
      if (a.data === 'prisma') return ['prisma-migrate', 'It generates migrations from your Prisma schema.'];
      if (a.data === 'drizzle') return ['drizzle-kit', 'It generates migrations from your Drizzle schema.'];
      if (a.language === 'typescript') return a.database === 'postgresql' ? ['node-pg-migrate', 'It works with any data library and stays in your own language.'] : ['flyway-any', 'Numbered SQL files are simple to write, and it works with any data library.'];
      if (a.framework === 'django') return ['django-migrations', 'It generates migrations from your models, and comes with Django.'];
      if (a.data === 'sqlalchemy') return ['alembic', 'It is made for SQLAlchemy and can generate most migrations from your models.'];
      if (a.language === 'python') return ['flyway-any', 'It runs plain SQL files without needing an ORM.'];
      return ['goose', 'It runs plain SQL files in order and can be built into your binary.'];
    },
    login: function (a) {
      if (a.language === 'java' && a.framework === 'spring-boot') return ['spring-security', 'It is built for your framework and handles sessions, password hashing and roles. Use a hosted provider if you need single sign-on or multi-factor login without building them.'];
      if (a.language === 'go' || (a.language === 'python' && a.framework !== 'django')) return ['auth0', 'Your framework has no complete login system of its own, and login is risky to build yourself. A hosted provider handles the security for you.'];
      return ['own', 'It is built for your framework and handles sessions, password hashing and roles. Use a hosted provider if you need single sign-on or multi-factor login without building them.'];
    },
    admin: function (a) {
      if (a.framework === 'django') return ['django-admin', 'It generates a working admin area from your models, so it takes minutes rather than weeks.'];
      if (a.api === 'rest') return ['react-admin', 'It gives you ready-made lists, forms and filters on top of your API, which saves building each screen.'];
      return ['in-app', 'It reuses your login, roles and business logic, with nothing extra to run.'];
    },
    payment: function () { return ['stripe', 'It has the best documentation and test mode, and its hosted checkout takes most card-security work off your hands. Consider adding Klarna for Nordic customers.']; },
    contentHost: function (a) {
      if (a.siteStack === 'nextjs') return ['netlify', 'It has straightforward Next.js support and deploys directly from Git.'];
      return ['cloudflare', 'It is very fast worldwide, has a free tier and deploys directly from Git.'];
    },
    hosting: function (a) {
      if (['wordpress', 'woocommerce'].indexOf(a.siteStack) >= 0) return ['managed-wp', 'The host handles updates, backups and caching, which are the main work of running WordPress.'];
      return ['paas', 'It handles servers and HTTPS, so you can spend your time on the app. Move to something else only when cost or control becomes a real problem.'];
    },
    distribution: function (a) {
      var p = a.platforms || [];
      if (p.indexOf('pc') >= 0) return ['steam', 'It has by far the largest PC audience, and it handles payments and updates. Publish on itch.io first if you want early feedback.'];
      if (p.indexOf('mobile') >= 0) return ['app-stores', 'Almost all mobile players get their games here.'];
      if (p.indexOf('console') >= 0) return ['console-stores', 'Consoles only sell through these.'];
      return ['itch', 'It is free to publish, has good browser game support, and is very quick to launch.'];
    }
  };
  var MANAGED_WP = o('managed-wp', 'Managed WordPress hosting', 'A host that specializes in WordPress and runs the server for you.',
    ['Updates and backups are handled', 'Caching is set up for you', 'Very little server knowledge needed', 'Support understands WordPress', 'Good security defaults'],
    ['Costs more than basic hosting', 'Some plugins may be restricted', 'Limits on traffic or sites', 'Less control over the server', 'Moving host takes some work'], 'https://wordpress.org/hosting/');

  // Why a stage or question isn't asked. Null means it belongs to another kind of project.
  function named(list, id) { var f = list.filter(function (x) { return x.id === id; })[0]; return f ? f.name : id; }
  function stackName(a) { return named(has(a, 'store') ? STORE_STACK : CONTENT_STACK, a.siteStack); }
  function engineName(a) { return named(ENGINE, a.engine); }
  function serviceName(a) { return a.gameBackend === 'steamworks' ? 'Your platform service' : named(GAME_BACKEND, a.gameBackend); }
  function isCustomChoice(a) { return forcedCustom(a) || a.siteStack === 'custom'; }
  var STAGE_SKIP = {
    approach: function (a) { return NODE_SKIP.siteStack(a); },
    backend: function (a) {
      if (isGame(a)) return hasOnline(a) ? serviceName(a) + ' runs your online features, so you don\'t write a server of your own.' : 'A single-player game has no server to write. All of your code runs inside the game.';
      if (a.siteStack === 'shopify') return 'Shopify runs the backend for you.';
      if (['astro', 'hugo'].indexOf(a.siteStack) >= 0) return stackName(a) + ' builds plain pages ahead of time, so there is no backend to write.';
      return stackName(a) + ' comes with its own server code, so there is no backend language to choose.';
    },
    interface: function (a) {
      if (isGame(a)) return 'Your game draws everything players see through ' + engineName(a) + ', so there is no web frontend or browser API to choose.';
      if (['medusa', 'saleor'].indexOf(a.siteStack) >= 0) return stackName(a) + ' keeps the shop pages separate from its backend. Its official Next.js storefront template is the usual start, so this planner doesn\'t ask.';
      if (a.siteStack === 'shopify' || a.siteStack === 'woocommerce' || a.siteStack === 'wordpress') return stackName(a) + ' makes the pages from a theme, so there is no frontend framework to choose.';
      return stackName(a) + ' makes the pages itself, so there is no separate frontend to choose.';
    },
    data: function (a) {
      if (a.siteStack === 'shopify') return 'Shopify stores your products and orders.';
      if (['astro', 'hugo', 'nextjs'].indexOf(a.siteStack) >= 0) return 'Your content comes from the source you chose in the Approach stage, so there is no database to choose.';
      return stackName(a) + ' defines its own data structure, so you only run the database it requires.';
    },
    services: function (a) {
      if (isGame(a)) return (hasOnline(a) ? serviceName(a) + ' provides player accounts, so there is no login to choose.' : 'A single-player game needs no login.') + ' ' + ((a.gameExtras || []).length ? a.gameExtras.map(function (x) { return NODE_SKIP[x](a); }).join(' ') : 'You didn\'t pick achievements, crash reports or analytics.') + ' Your store handles game sales.';
      if (a.siteStack === 'shopify') return 'Shopify includes login, admin and payments.';
      if (a.siteStack === 'wordpress') return 'WordPress includes its own login and admin, and you didn\'t pick selling.';
      return 'You didn\'t pick accounts, an admin area or selling.';
    },
    delivery: function (a) { return a.siteStack === 'shopify' ? 'Shopify hosts your store.' : ''; }
  };
  var NODE_SKIP = {
    siteStack: function (a) {
      if (!isWeb(a)) return null;
      return (has(a, 'live') ? 'You picked live updates' : 'You picked accounts or an admin area without selling') + ', which this planner treats as a custom web app, so it doesn\'t offer ready-made platforms.';
    },
    contentSource: function (a) {
      if (!isWeb(a)) return null;
      return isCustomChoice(a) ? 'Your own backend decides where content lives, and that is covered by the Data stage.' : stackName(a) + ' stores content itself.';
    },
    gameBackend: function (a) { return isGame(a) ? 'A single-player game has no online features to run.' : null; },
    build: function (a) { return 'This planner only compares build tools for Java. The setup docs for your ' + (a.language === 'typescript' ? 'TypeScript' : a.language === 'csharp' ? 'C#' : a.language === 'python' ? 'Python' : 'Go') + ' framework cover its usual tool.'; },
    frontend: function (a) { return isGame(a) ? null : 'Blazor is already your frontend.'; },
    frontendLanguage: function (a) {
      if (isGame(a) || !a.framework) return null;
      if (a.framework === 'blazor') return 'Blazor frontends are written in C#.';
      if (a.framework === 'nextjs') return 'This Next.js guide keeps frontend and backend in TypeScript together.';
      if (a.frontend === 'angular') return 'Angular only uses TypeScript.';
      if (a.frontend === 'vaadin') return 'Vaadin frontends are written in Java.';
      return a.frontend ? 'Your pages are HTML from your backend, so there\'s no separate frontend language.' : null;
    },
    transport: function (a) {
      if (isGame(a)) return null;
      if (a.framework === 'quarkus' && a.frontend === 'vaadin') return 'Vaadin pushes updates to the browser itself.';
      return a.framework === 'blazor' ? 'Interactive Blazor already pushes updates over its own live connection.' : 'You didn\'t pick live updates.';
    },
    scripting: function (a) { return isGame(a) ? engineName(a) + ' has one main language: ' + SINGLE_LANGUAGE[a.engine] + '.' : null; },
    database: function (a) { return isGame(a) ? (hasOnline(a) ? serviceName(a) + ' handles your online data, so there is no database to choose.' : 'With no server, there is no server database.') : null; },
    data: function (a) { return a.database === 'mongodb' ? 'MongoDB doesn\'t use SQL tables, so there is no SQL library to choose.' : null; },
    migrations: function (a) { return a.database === 'mongodb' ? 'MongoDB has no fixed table structure, so there is no migration tool to choose.' : null; },
    achievements: function (a) {
      if (!isGame(a)) return null;
      return extra(a, 'achievements') ? 'A browser-only game with no online backend has no store or server system to use, so build them inside the game.' : 'You didn\'t pick achievements or leaderboards.';
    },
    crash: function (a) {
      if (!isGame(a)) return null;
      return extra(a, 'crash') ? 'This planner doesn\'t list a crash service with official support for ' + engineName(a) + '. Plan on a log file that players can send you.' : 'You didn\'t pick crash reports.';
    },
    analytics: function (a) { return isGame(a) ? 'You didn\'t pick player analytics.' : null; },
    login: function (a) {
      if (isGame(a)) return hasOnline(a) ? serviceName(a) + ' provides player accounts, so there is no login to choose.' : 'A single-player game needs no login.';
      return isCustomChoice(a) ? 'You didn\'t pick accounts or an admin area.' : stackName(a) + ' handles its own login.';
    },
    admin: function (a) {
      if (isGame(a)) return isGameBackend(a) ? 'This planner only asks this for websites. Admin tools for a game backend are yours to build.' : null;
      return isCustomChoice(a) ? 'You didn\'t pick an admin area.' : stackName(a) + ' includes its own admin area.';
    },
    payment: function (a) { return isGame(a) ? 'Your store handles game sales.' : 'You didn\'t pick selling.'; },
    hosting: function (a) {
      if (!isGame(a)) return null;
      if (!hasOnline(a)) return 'A single-player game has no server to host.';
      if (a.gameBackend === 'nakama') return null;
      return a.gameBackend === 'playfab' ? 'Microsoft hosts PlayFab for you.' : 'The platform runs these services for you.';
    }
  };
  function stageSkipReason(stage, a) { return STAGE_SKIP[stage] ? STAGE_SKIP[stage](a) : ''; }
  function nodeSkipReason(id, a) { return NODE_SKIP[id] ? NODE_SKIP[id](a) : null; }

  function nodes(J) {
    function card(key, a) { var list = J[key].options; return a.language === 'java' ? list : list.map(generic); }
    var list = [
      // Product
      { id: 'product', stage: 'product', title: 'Game or website?', why: 'This decides every question that follows.', when: function () { return true; }, options: function () { return PRODUCT; }, noCompare: true },

      // Requirements: what it must do, before any technology.
      { id: 'needs', stage: 'requirements', title: 'What does the site need beyond pages to read?', why: 'Pick all that apply, or none for a content site such as a blog or portfolio. Your needs decide which questions come next.', when: isWeb, options: function () { return NEEDS; }, multi: true, allowEmpty: true, emptyLabel: 'Just pages to read', noCompare: true },
      { id: 'platforms', stage: 'requirements', title: 'Which platforms will the game run on?', why: 'Pick all that apply. This limits which engines and stores fit.', when: isGame, options: function () { return PLATFORMS; }, multi: true, start: '' },
      { id: 'graphics', stage: 'requirements', title: 'Will the game be 2D or 3D?', why: 'This narrows the engine list more than any other requirement, and it is very hard to change later.', when: isGame, options: function () { return GRAPHICS; } },
      { id: 'multiplayer', stage: 'requirements', title: 'Will it have online play?', why: 'This is often the biggest cost decision in a game, so start small if you can.', when: isGame, options: function () { return MULTIPLAYER; }, start: '' },

      // Approach: buy, adopt or build.
      { id: 'siteStack', stage: 'approach', title: 'How do you want to build the site?', why: 'Use an existing platform when it covers your needs, and write your own backend when it doesn\'t, or when learning is the goal.', when: function (a) { return isWeb(a) && !!a.needs && !forcedCustom(a); }, options: function (a) { return has(a, 'store') ? STORE_STACK : CONTENT_STACK; }, startFn: function (a) { return has(a, 'store') ? 'Shopify is the fastest way to sell. Choose a custom backend if your goal is learning.' : 'Astro gives you fast pages and room to grow, and you can edit content as files.'; } },
      { id: 'contentSource', stage: 'approach', title: 'Where will the content live?', why: 'This depends on who will edit the site.', when: isStaticStack, options: function () { return CONTENT_SOURCE; }, start: '' },
      { id: 'gameExtras', stage: 'requirements', title: 'Does the game need any of these?', why: 'Pick all that apply, or none. Each one adds a question later.', when: isGame, options: function () { return GAME_EXTRAS; }, multi: true, allowEmpty: true, emptyLabel: 'None of these', noCompare: true },
      { id: 'engine', stage: 'approach', title: 'Which engine or library?', why: 'An option has to support every platform you picked, and suit 2D or 3D. Online play doesn\'t limit this list.', when: isGame, options: function (a) {
        return ENGINE.filter(function (e) { return engineFits(e, a.platforms || []) && graphicsFits(e, a.graphics); });
      }, hiddenNote: function (a) {
        var hidden = ENGINE.filter(function (e) { return !engineFits(e, a.platforms || []); }).map(function (e) { return e.name; });
        var wrongKind = ENGINE.filter(function (e) { return engineFits(e, a.platforms || []) && !graphicsFits(e, a.graphics); }).map(function (e) { return e.name; });
        var kind = a.graphics === '2d' ? 'mainly for 3D' : 'mainly for 2D';
        if (a.graphics === 'mixed') kind = 'not built to handle both';
        return (hidden.length ? 'Hidden because they don\'t support all of your platforms: ' + hidden.join(', ') + '. ' : '') + (wrongKind.length ? 'Hidden because they are ' + kind + ': ' + wrongKind.join(', ') + '.' : '');
      }, start: '' },
      { id: 'scripting', stage: 'approach', title: 'Which language will you write the game in?', why: 'Your engine decides which languages are available.', when: function (a) { return isGame(a) && !!a.engine && !!SCRIPTING[a.engine]; }, options: scriptingOptions, hiddenNote: function (a) {
        if (a.engine === 'godot' && (a.platforms || []).indexOf('web') >= 0) return 'Hidden because Godot 4 can\'t export C# projects to the web: C#.';
        if (a.engine === 'libgdx' && (a.platforms || []).indexOf('web') >= 0) return 'Hidden because Kotlin can\'t use libGDX\'s standard web target: Kotlin.';
        return '';
      } },
      { id: 'gameBackend', stage: 'approach', title: 'What will run the online features?', why: 'You may not need to write a server at all.', when: hasOnline, options: function (a) {
        var p = a.platforms || [];
        return GAME_BACKEND.filter(function (g) {
          if (g.id !== 'steamworks') return true;
          return a.multiplayer === 'p2p' && (p.indexOf('pc') >= 0 || p.indexOf('mobile') >= 0);
        });
      }, start: '' },

      // Backend: language first, because everything below depends on it.
      { id: 'language', stage: 'backend', title: 'Which backend language?', why: 'This decides your framework and libraries.', when: needsServer, options: function () { return LANGUAGE.slice().sort(function (x, y) { return x.name < y.name ? -1 : 1; }); }, start: '' },
      { id: 'framework', stage: 'backend', title: 'Which backend framework?', why: 'The framework provides the HTTP server integration, configuration and links to other libraries.', when: function (a) { return needsServer(a) && !!a.language; }, options: function (a) { return a.language === 'java' ? card('framework', a) : FRAMEWORKS[a.language]; }, startFn: function (a) { return a.language === 'java' ? J.framework.start : null; } },
      { id: 'build', stage: 'backend', title: 'Which build tool?', why: J.build.why, when: function (a) { return needsServer(a) && a.language === 'java'; }, options: function (a) { return card('build', a); }, startFn: function () { return J.build.start; } },

      // Interface: what users see, then how it talks to the backend.
      { id: 'frontend', stage: 'interface', title: 'How will users see the site?', why: J.frontend.why, when: function (a) { return isCustomWeb(a) && !!a.framework && a.framework !== 'blazor'; }, options: function (a) {
        var list = card('frontend', a);
        if (a.framework === 'nextjs') return list.filter(function (x) { return x.id === 'react'; }).map(function (x) { return Object.assign({}, x, { start: true, sum: 'Next.js is built on React, so this is the only frontend that fits your framework.' }); });
        if (a.language !== 'java' || nonSpring(a)) {
          list = list.filter(function (x) {
            if (x.id === 'thymeleaf') return false;
            return x.id !== 'vaadin' || a.framework === 'quarkus';
          }).concat([Object.assign({}, SERVER_TEMPLATES, { start: true })]);
        }
        return list;
      }, startFn: function (a) {
        if (a.framework === 'nextjs') return null;
        return a.language === 'java' && !nonSpring(a) ? J.frontend.start : 'Server-rendered templates keep your focus on the backend. Choose React if you need a rich interface.';
      } },
      { id: 'frontendLanguage', stage: 'interface', title: 'Which language will the frontend use?', why: 'Browsers run JavaScript. TypeScript adds type checks while you build, then compiles down to JavaScript.', when: function (a) { return isCustomWeb(a) && (a.frontend === 'react' || a.frontend === 'vue') && a.framework !== 'nextjs'; }, options: function () {
        return [
          o('typescript', 'TypeScript', 'JavaScript with types, which are checked before the code runs.',
            ['Catches many mistakes before the code runs', 'AI tools get instant feedback on their code', 'Editors can complete and rename reliably', 'Types document what data looks like', 'Standard for new React and Vue projects'],
            ['Adds a build step', 'More syntax to learn', 'Types add some extra code', 'Library types are sometimes wrong', 'Types are gone when the code runs'], 'https://www.typescriptlang.org/docs/', true),
          o('javascript', 'JavaScript', 'The language browsers run, with no type checking.',
            ['Nothing extra to learn', 'Less code to write', 'Runs in the browser as it is', 'Easy for very small projects', 'Every example online can be used'],
            ['Mistakes wait until the code runs', 'AI\'s mistakes get caught later', 'Harder to change safely as it grows', 'Editors can do less for you', 'Needs more tests for the same confidence'], 'https://developer.mozilla.org/en-US/docs/Web/JavaScript')
        ];
      }, startFn: function () { return 'Type checks catch mistakes early, including your AI tool\'s, and they cost little to adopt.'; }, hiddenNote: function (a) { return a.framework === 'spring-boot' ? 'The Spring Boot steps on this page use JavaScript, whichever you choose here.' : ''; } },
      { id: 'api', stage: 'interface', title: 'How will clients talk to the backend?', why: J.api.why + ' gRPC isn\'t listed, because browsers can\'t call it directly.', when: function (a) { return isCustomWeb(a) && !!a.framework; }, options: function (a) {
        var list = card('api', a).filter(function (x) { return x.id !== 'grpc'; });
        if (['react', 'vue', 'angular'].indexOf(a.frontend) >= 0) {
          list = list.filter(function (x) { return x.id !== 'server'; }).map(function (x) { return x.id === 'rest' ? Object.assign({}, x, { start: true }) : x; });
        }
        return list;
      }, startFn: function (a) { return ['react', 'vue', 'angular'].indexOf(a.frontend) >= 0 ? 'REST is the simplest fit for a separate frontend.' : J.api.start; } },
      { id: 'transport', stage: 'interface', title: 'How will live updates reach the browser?', why: 'This is what makes the site live.', when: function (a) { return isCustomWeb(a) && has(a, 'live') && !!a.framework && a.framework !== 'blazor' && !(a.framework === 'quarkus' && a.frontend === 'vaadin'); }, options: function (a) {
        return TRANSPORT.filter(function (t) { return t.id !== 'library' || a.language === 'csharp' || a.language === 'typescript'; });
      }, start: '' },

      // Data: database, then the library, then how its structure changes.
      { id: 'saves', stage: 'data', title: 'How will the game keep players\' progress?', why: 'A game\'s data is usually its saves, even with no server.', when: function (a) { return isGame(a) && !!a.engine && (!hasOnline(a) || !!a.gameBackend) && (!isGameBackend(a) || !!a.framework); }, options: function (a) {
        return SAVES.filter(function (s) {
          if (s.id === 'store-cloud') return hasNativePlatform(a);
          if (s.id === 'backend') return hasOwnOnlineData(a);
          return true;
        });
      } },
      { id: 'database', stage: 'data', title: 'Which database?', why: J.database.why, when: function (a) { return needsServer(a) && !!a.framework; }, options: function (a) {
        var list = card('database', a);
        if (a.language !== 'java') list = list.filter(function (x) { return x.id !== 'h2'; }).concat([SQLITE]);
        return list;
      }, startFn: function () { return J.database.start; } },
      { id: 'data', stage: 'data', title: 'How will your code talk to the database?', why: J.data.why, when: function (a) { return needsServer(a) && a.database && a.database !== 'mongodb'; }, options: function (a) {
        if (a.language === 'java') {
          var javaData = card('data', a);
          if (nonSpring(a)) javaData = javaData.filter(function (x) { return x.id !== 'jdbc'; }).map(function (x) { return x.id === 'jpa' ? Object.assign({}, x, { name: a.framework === 'jakarta-ee' ? 'EclipseLink (JPA)' : 'Hibernate (JPA)', sum: a.framework === 'jakarta-ee' ? 'Maps objects to rows and generates common SQL. Open Liberty ships with it as its JPA provider.' : 'Maps objects to rows and generates common SQL. Your framework has its own integration.' }) : x; });
          return javaData.filter(function (x) { return x.id !== 'jooq' || a.database !== 'sqlserver'; });
        }
        return DATA[a.language].filter(function (d) {
          if (d.id === 'django-orm') return a.framework === 'django';
          if (a.framework === 'django') return false;
          if (d.id === 'psycopg') return a.database === 'postgresql';
          if (d.id === 'sqlc' || d.id === 'drizzle' || d.id === 'ent') return a.database !== 'sqlserver';
          return true;
        }).map(function (d) { return (a.language === 'python' && a.framework !== 'django' && d.id === 'sqlalchemy') ? Object.assign({}, d, { start: true }) : d; });
      }, startFn: function (a) { return a.language === 'java' ? J.data.start : null; } },
      { id: 'migrations', stage: 'data', title: 'How will you change the database structure over time?', why: J.migrations.why, when: function (a) { return needsServer(a) && a.database && a.database !== 'mongodb'; }, options: function (a) {
        if (a.language === 'java') {
          return card('migrations', a);
        }
        return MIGRATIONS[a.language].filter(function (m) {
          if (m.id === 'ef-migrations') return a.data === 'efcore';
          if (m.id === 'prisma-migrate') return a.data === 'prisma';
          if (m.id === 'drizzle-kit') return a.data === 'drizzle';
          if (m.id === 'django-migrations') return a.framework === 'django';
          if (m.id === 'alembic') return a.data === 'sqlalchemy';
          if (m.id === 'node-pg-migrate') return a.database === 'postgresql';
          return true;
        }).map(function (m) {
          if (m.id !== 'atlas' || a.database !== 'sqlserver') return m;
          return Object.assign({}, m, { sum: m.sum + ' Its SQL Server support is only in the paid Pro Plan.', cons: ['SQL Server needs the paid Pro Plan'].concat(m.cons.filter(function (c) { return c !== 'Some features are paid'; })) });
        }).concat(a.language === 'typescript' ? [] : [FLYWAY_ANY]);
      }, startFn: function (a) { return a.language === 'java' ? J.migrations.start : 'Use the tool that comes with your data library if there is one.'; } },

      // Services: features that sit on top of the data layer.
      { id: 'login', stage: 'services', title: 'How will users log in?', why: J.login.why, when: function (a) { return !!a.database && (isGameBackend(a) || (isCustomWeb(a) && wantsLogin(a))); }, options: function (a) {
        var list = card('login', a);
        if (a.language !== 'java' || nonSpring(a)) {
          list = list.map(function (x) {
            if (x.id !== 'spring-security') return x;
            var own = a.language === 'java' ? ['Your framework\'s security module', null] : OWN_LOGIN[a.language];
            return Object.assign({}, x, { id: 'own', name: a.language !== 'python' ? own[0] : (a.framework === 'django' ? 'Django auth' : 'Your framework\'s login library'), sum: 'Your app stores users and password hashes, using your framework\'s tools.', url: own[1], pros: x.pros.map(function (t) { return t.replace('Simple role checks with Spring Security', 'Simple role checks in your framework'); }) });
          });
        }
        return list;
      }, startFn: function (a) { return a.language === 'java' && !nonSpring(a) ? J.login.start : 'Your framework\'s own login tools are simplest for one app with simple roles. Use a provider for single sign-on or multi-factor login.'; } },
      { id: 'admin', stage: 'services', title: 'How will staff manage data?', why: J.admin.why, when: function (a) { return isCustomWeb(a) && has(a, 'admin') && !!a.login; }, options: function (a) {
        var list = card('admin', a);
        if (a.language !== 'java' || (nonSpring(a) && a.framework !== 'quarkus')) list = list.filter(function (x) { return x.id !== 'vaadin-admin'; });
        if (a.api !== 'rest') list = list.filter(function (x) { return x.id !== 'react-admin'; });
        if (a.framework === 'django') list = [DJANGO_ADMIN].concat(list.map(function (x) { return Object.assign({}, x, { start: false }); }));
        return list;
      }, startFn: function (a) { return a.framework === 'django' ? 'Django admin gives you a working admin area immediately.' : J.admin.start; } },
      { id: 'payment', stage: 'services', title: 'Which payment provider?', why: 'Never handle raw card numbers yourself. A provider takes that risk and work.', when: function (a) {
        if (!isWeb(a) || !has(a, 'store')) return false;
        if (isCustomWeb(a)) return !!a.database;
        return !!a.siteStack && a.siteStack !== 'shopify';
      }, options: function () { return PAYMENT; }, start: '' },

      { id: 'achievements', stage: 'services', title: 'How will achievements and leaderboards work?', why: 'Your platforms and backend decide what is available.', when: function (a) { return isGame(a) && extra(a, 'achievements') && !!a.saves && (hasNativePlatform(a) || hasOwnOnlineData(a)); }, options: function (a) {
        return ACHIEVEMENTS.filter(function (x) {
          if (x.id === 'store') return hasNativePlatform(a);
          if (x.id === 'backend') return hasOwnOnlineData(a);
          return true;
        });
      } },
      { id: 'crash', stage: 'services', title: 'How will you find out about crashes?', why: 'Most players never report a crash, so they just stop playing.', when: function (a) { return isGame(a) && extra(a, 'crash') && !!a.saves && SENTRY_ENGINES.indexOf(a.engine) >= 0; }, options: function (a) {
        return CRASH.filter(function (x) {
          if (x.id === 'sentry') return SENTRY_ENGINES.indexOf(a.engine) >= 0;
          if (x.id === 'crashlytics') return a.engine === 'unity' && (a.platforms || []).indexOf('mobile') >= 0;
          return true;
        });
      } },
      { id: 'analytics', stage: 'services', title: 'How will you see how people play?', why: 'Choose the simplest option that answers the questions you actually have.', when: function (a) { return isGame(a) && extra(a, 'analytics') && !!a.saves; }, options: function (a) {
        var p = a.platforms || [];
        return ANALYTICS.filter(function (x) {
          if (x.id === 'unity-analytics') return a.engine === 'unity';
          if (x.id === 'firebase') return FIREBASE_ENGINES.indexOf(a.engine) >= 0 && (p.indexOf('mobile') >= 0 || p.indexOf('web') >= 0);
          if (x.id === 'own-backend') return a.gameBackend === 'custom';
          return true;
        });
      } },

      // Delivery: last, because it has to run everything chosen above.
      { id: 'serviceHost', stage: 'delivery', title: 'Where will Nakama run?', why: 'Nakama is a server, so someone has to run it, along with its database.', when: function (a) { return isGame(a) && a.gameBackend === 'nakama' && !!a.saves; }, options: function () { return SERVICE_HOST; } },
      { id: 'contentHost', stage: 'delivery', title: 'Where will you host it?', why: 'Static sites can be hosted very cheaply.', when: isStaticStack, options: function (a) { return a.siteStack === 'nextjs' ? CONTENT_HOST.filter(function (x) { return x.id !== 'github-pages'; }) : CONTENT_HOST; }, start: '' },
      { id: 'hosting', stage: 'delivery', title: 'Where will it run?', why: J.hosting.why, when: function (a) { return (needsServer(a) && !!a.database) || (isWeb(a) && has(a, 'store') && !forcedCustom(a) && ['woocommerce', 'medusa', 'saleor'].indexOf(a.siteStack) >= 0) || (isWeb(a) && !has(a, 'store') && !forcedCustom(a) && a.siteStack === 'wordpress'); }, options: function (a) {
        if (['wordpress', 'woocommerce'].indexOf(a.siteStack) >= 0) return [MANAGED_WP].concat(J.hosting.options.map(generic).filter(function (x) { return x.id === 'vps' || x.id === 'containers'; }));
        return a.language === 'java' ? card('hosting', a) : J.hosting.options.map(generic);
      }, startFn: function () { return J.hosting.start; } },
      { id: 'distribution', stage: 'delivery', title: 'Where will players get it?', why: 'Choose your main store first. You can add others later.', when: function (a) { return isGame(a) && !!a.saves; }, options: function (a) {
        var p = a.platforms || [];
        return DISTRIBUTION.filter(function (d) {
          if (needsStoreFeatures(a) && ['itch', 'own-site'].indexOf(d.id) >= 0) return false;
          if (d.id === 'steam') return p.indexOf('pc') >= 0;
          if (d.id === 'app-stores') return p.indexOf('mobile') >= 0;
          if (d.id === 'console-stores') return p.indexOf('console') >= 0;
          return p.indexOf('pc') >= 0 || p.indexOf('web') >= 0;
        });
      }, hiddenNote: function (a) {
        return needsStoreFeatures(a) ? 'Hidden because you picked store features that they don\'t provide: itch.io, Your own website.' : '';
      }, startFn: function (a) {
        var p = a.platforms || [];
        return (p.indexOf('pc') >= 0 || p.indexOf('web') >= 0) ? 'Publish on itch.io first for feedback, then go to a larger store for reach.' : null;
      } }
    ];
    list.forEach(function (n) { if (SUGGEST[n.id]) n.suggest = SUGGEST[n.id]; });
    return list;
  }

  return { ENGINE: ENGINE, engineFits: engineFits, nodes: nodes, isCustomWeb: isCustomWeb, has: has, STAGES: STAGES, STAGE_ORDER: STAGE_ORDER, stageSkipReason: stageSkipReason, nodeSkipReason: nodeSkipReason };
})();
