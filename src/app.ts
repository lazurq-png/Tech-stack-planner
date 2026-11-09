// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { Tree } from './tree';
import { Recipes } from './recipes';
import { StackKit } from './stack';
import { docsFor as docsForAnswers, docsOld, docsLine, comboDocs, SIBLINGS, FW_NAME } from './docs';
import JAVA_DATA from '../data/java-data.json';
import STACK_STATUS from '../data/stack-status.json';
import statusData from '../data/status.json';

declare const hljs: any;

(function () {
  var STORE = 'tech-stack-flow-v2';
  var NODES = Tree.nodes(JAVA_DATA);
  var STATUS = statusData;
  var answers = {}, editing = null, multiOpen = {}, editOriginal = null;
  function docsFor(node, opt) { return docsForAnswers(answers, node, opt); }

  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && saved.answers) answers = saved.answers;
  } catch (e) { /* works without storage */ }
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ answers: answers })); } catch (e) { /* optional */ } }

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function html(tag, cls, content) { var el = document.createElement(tag); if (cls) el.className = cls; el.innerHTML = content; return el; }

  function highlight(el, lang) {
    if (!window.hljs) return;
    if (lang && !hljs.getLanguage(lang)) return;
    el.removeAttribute('data-highlighted');
    el.classList.remove('hljs');
    hljs.highlightElement(el);
  }
  function addCopy(box) {
    if (box.querySelector('.copy')) return;
    var code = box.querySelector('code');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy';
    button.textContent = 'Copy';
    button.addEventListener('click', function () {
      function done(label) { button.textContent = label; setTimeout(function () { button.textContent = 'Copy'; }, 1500); }
      function selectText() {
        var range = document.createRange();
        range.selectNodeContents(code);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        done('Press Ctrl+C');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code.textContent).then(function () { done('Copied'); }, selectText);
      else selectText();
    });
    box.appendChild(button);
  }
  function codeBox(text, lang) {
    var box = document.createElement('div');
    box.className = 'code';
    var pre = document.createElement('pre');
    var code = document.createElement('code');
    code.className = lang ? 'language-' + lang : 'nohighlight';
    code.dataset.dyn = '1';
    code.textContent = text;
    pre.appendChild(code);
    box.appendChild(pre);
    if (lang) highlight(code, lang);
    addCopy(box);
    return box;
  }
  function dl(lines) {
    var list = document.createElement('dl');
    list.className = 'lines';
    lines.forEach(function (l) {
      var row = document.createElement('div');
      row.innerHTML = '<dt><code>' + l[0] + '</code></dt><dd>' + l[1] + '</dd>';
      list.appendChild(row);
    });
    return list;
  }
  function renderItems(items, into, gradle) {
    items.forEach(function (it) {
      if (it.p) into.appendChild(html('p', '', it.p));
      if (it.warn) into.appendChild(html('aside', 'note warn', '<p><span class="tag">Watch out</span>' + it.warn + '</p>'));
      if (it.cmd) {
        into.appendChild(codeBox(gradle ? toGradle(it.cmd) : it.cmd, 'bash'));
        if (it.lines) into.appendChild(dl(it.lines));
      }
      if (it.file) {
        into.appendChild(html('p', 'file', esc(it.file)));
        into.appendChild(codeBox(it.code, it.lang));
        if (it.lines && it.lines.length) into.appendChild(dl(it.lines));
        if (it.cpp) into.appendChild(html('aside', 'note cpp', '<p><span class="tag">Note</span>' + it.cpp + '</p>'));
        if (it.after) renderItems(it.after, into, gradle);
      }
    });
  }

  var GRADLE_MAP = [
    [/\.\/mvnw spring-boot:run -Dspring-boot\.run\.profiles=dev/g, "./gradlew bootRun --args='--spring.profiles.active=dev'"],
    [/-Dspring-boot\.run\.profiles=dev/g, "--args='--spring.profiles.active=dev'"],
    [/\.\/mvnw spring-boot:run/g, './gradlew bootRun'],
    [/spring-boot:run/g, 'bootRun'],
    [/\.\/mvnw test -Dtest=TaskControllerTests/g, './gradlew test --tests TaskControllerTests'],
    [/\.\/mvnw clean package/g, './gradlew clean bootJar'],
    [/\.\/mvnw compile/g, './gradlew classes'],
    [/\.\/mvnw dependency:tree/g, './gradlew dependencies'],
    [/\.\/mvnw -version/g, './gradlew --version'],
    [/\.\/mvnw/g, './gradlew'],
    [/target\/demo-0\.0\.1-SNAPSHOT\.jar/g, 'build/libs/demo-0.0.1-SNAPSHOT.jar'],
    [/target\//g, 'build/']
  ];
  function toGradle(text) { GRADLE_MAP.forEach(function (m) { text = text.replace(m[0], m[1]); }); return text; }
  function depBlock(deps, gradle) {
    if (gradle) {
      return deps.map(function (d) {
        var conf = d.scope === 'runtime' ? 'runtimeOnly' : d.scope === 'test' ? 'testImplementation' : 'implementation';
        return conf + '("' + d.g + ':' + d.a + (d.version ? ':' + d.version : '') + '")';
      }).join('\n');
    }
    return deps.map(function (d) {
      return '<dependency>\n\t<groupId>' + d.g + '</groupId>\n\t<artifactId>' + d.a + '</artifactId>\n' + (d.version ? '\t<version>' + d.version + '</version>\n' : '') + (d.scope ? '\t<scope>' + d.scope + '</scope>\n' : '') + '</dependency>';
    }).join('\n');
  }
  function devtoolsGradle(text) {
    return text.indexOf('spring-boot-devtools') >= 0 ? 'developmentOnly("org.springframework.boot:spring-boot-devtools")' : text;
  }
  function chip(key) {
    var st = STATUS[key];
    return st ? '<span class="chip ' + st.l + '">' + esc(st.t) + '</span>' : '';
  }
  function evalShow(expr, s) {
    return expr.split(' ').every(function (part) {
      var kv = part.split(':'), want = kv[1], neg = want.charAt(0) === '!';
      if (neg) want = want.slice(1);
      var match = want.split(',').indexOf(s[kv[0]]) >= 0;
      return neg ? !match : match;
    });
  }

  // Later questions depend on this answer, so changing it starts them again.
  function clearAfter(id) {
    var seen = false;
    NODES.forEach(function (n) {
      if (seen) delete answers[n.id];
      if (n.id === id) seen = true;
    });
  }
  function laterAnswerCount(id) {
    var seen = false, count = 0;
    NODES.forEach(function (n) {
      if (seen && answers[n.id] !== undefined) count++;
      if (n.id === id) seen = true;
    });
    return count;
  }
  function stopEditing(keep) {
    if (editing && !keep) {
      if (editOriginal === undefined) delete answers[editing]; else answers[editing] = editOriginal;
    }
    if (editing) multiOpen[editing] = false;
    editing = null;
    editOriginal = null;
  }

  // Walks the tree in order and stops at the first question that still needs an answer.
  function walk() {
    var path = [], entries = [], current = null;
    for (var i = 0; i < NODES.length; i++) {
      var n = NODES[i];
      if (!n.when(answers)) { delete answers[n.id]; entries.push({ node: n }); continue; }
      var opts = n.options(answers);
      var a = answers[n.id];
      if (n.multi) {
        if (a) { a = a.filter(function (v) { return opts.some(function (o) { return o.id === v; }); }); answers[n.id] = a; }
        if (!a || (!a.length && !n.allowEmpty) || multiOpen[n.id]) a = null;
      } else if (a && !opts.some(function (o) { return o.id === a; })) {
        delete answers[n.id]; a = null;
      }
      if (!a || editing === n.id) { current = { node: n, options: opts }; break; }
      var step = { node: n, options: opts };
      path.push(step);
      entries.push({ node: n, step: step });
    }
    return { path: path, entries: entries, current: current };
  }
  // Each stage's state so far. Stages after the current question stay unknown until they're reached.
  function stageViews(w) {
    var at = w.current ? Tree.STAGE_ORDER.indexOf(w.current.node.stage) : Tree.STAGE_ORDER.length;
    return Tree.STAGE_ORDER.map(function (stage, i) {
      var entries = w.entries.filter(function (e) { return e.node.stage === stage; });
      var asked = entries.some(function (e) { return e.step; });
      var status = i === at ? 'now' : i > at ? 'later' : asked ? 'done' : 'skipped';
      return { stage: stage, number: i + 1, name: Tree.STAGES[stage], entries: entries, status: status };
    });
  }
  function skippedSince(views, w) {
    var last = -1;
    w.entries.forEach(function (e, i) { if (e.step) last = i; });
    var found = [], seen = {};
    w.entries.slice(last + 1).forEach(function (e) {
      var view = views.filter(function (v) { return v.stage === e.node.stage; })[0];
      if (view.status === 'skipped') {
        if (!seen[view.stage]) { seen[view.stage] = true; found.push(skipLine(view)); }
      } else {
        var why = Tree.nodeSkipReason(e.node.id, answers);
        if (why) found.push('<strong>' + esc(e.node.title) + '</strong> ' + esc(why));
      }
    });
    return found;
  }
  function skipLine(view) {
    return '<strong>Stage ' + view.number + ', ' + esc(view.name) + ':</strong> ' + esc(Tree.stageSkipReason(view.stage, answers));
  }
  function nameList(node, options, value) {
    var vals = node.multi ? value : [value];
    if (!vals.length) return node.emptyLabel || 'None';
    return vals.map(function (v) {
      var o = options.filter(function (x) { return x.id === v; })[0];
      return o ? o.name : v;
    }).join(', ');
  }

  // The comparison card stays open or closed as the visitor last left it.
  function compareOpen(value) {
    try {
      if (value !== undefined) localStorage.setItem('compare-open', value ? '1' : '0');
      return localStorage.getItem('compare-open') === '1';
    } catch (err) { return !!value; }
  }
  function compareCard(id) {
    var note = StackKit.stepNote(id, answers);
    if (!note) return null;
    var list = function (title, items) {
      return items && items.length ? '<div class="compare-part"><h4>' + title + '</h4><ul>' + items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' : '';
    };
    var table = '';
    if (note.table) {
      table = '<div class="compare-table"><table><thead><tr>' + note.table.head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + note.table.rows.map(function (r) {
        return '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';
    }
    var d = html('details', 'compare', '<summary>How these options compare</summary><div class="compare-body">' + list('What they share', note.shared) + list('Where they really differ', note.differs) + list('What carries over', note.carries) + table + list('Worth knowing', note.know) + '</div>');
    d.open = compareOpen();
    d.addEventListener('toggle', function () { compareOpen(d.open); });
    return d;
  }

  // Says what each test on this step measures, because different tests answer different questions.
  function benchNote(current) {
    var texts = StackKit.aiNote(current.node.id).slice();
    current.options.forEach(function (o) {
      var fit = StackKit.aiFit(current.node.id, o.id);
      if (fit) fit.evidence.forEach(function (e) { texts.push(e.url); });
    });
    var found = StackKit.aiBenches(texts);
    if (!found.length) return '';
    return '<details class="bench-note"><summary>What these tests measure</summary><ul>' + found.map(function (b) { return '<li><strong>' + esc(b.name) + ':</strong> ' + esc(b.tests) + '. ' + esc(b.scored) + '. Newest models: ' + esc(b.models) + '. ' + esc(b.date) + '.</li>'; }).join('') + '</ul></details>';
  }
  function answeredUsedBy(step) {
    var vals = step.node.multi ? answers[step.node.id] : [answers[step.node.id]];
    return (vals || []).map(function (v) {
      var used = StackKit.usedBy(step.node.id, v);
      return used ? '<span class="used-by">' + esc(used) + '</span>' : '';
    }).join('');
  }

  function fitLabel(fit) {
    return fit.level + (!fit.evidence.length ? ' (judgment)' : fit.evidence.every(function (e) { return e.related; }) ? ' (judgment, plus related tests)' : fit.evidence.length > 1 ? ' (' + fit.evidence.length + ' tests)' : ' (1 test only)');
  }
  // How well each chosen technology works with AI tools. Ratings only, no setup by AI.
  function aiCard(w) {
    var card = html('section', 'ai-card', '<h3 id="ai-support">How well your choices work with AI</h3><p>How well AI coding tools such as Claude Code, Cursor or GitHub Copilot handle each part of your stack, from current tests where they exist.</p>');
    var rows = [], ORDER = { limited: 0, good: 1, strong: 2 };
    w.path.forEach(function (step) {
      var vals = step.node.multi ? answers[step.node.id] : [answers[step.node.id]];
      step.options.forEach(function (o) {
        var fit = StackKit.aiFit(step.node.id, o.id);
        if (vals.indexOf(o.id) >= 0 && fit) rows.push({ name: o.name, fit: fit });
      });
    });
    if (rows.length) {
      rows.sort(function (x, y) { return ORDER[x.fit.level] - ORDER[y.fit.level]; });
      card.appendChild(html('ul', 'plain', rows.map(function (r) {
        return '<li class="ai-fit ' + r.fit.level + '"><span>' + esc(r.name) + ': ' + fitLabel(r.fit) + '</span> ' + esc(r.fit.why) + '.' + (r.fit.evidence.length ? '<ul class="ai-tests">' + r.fit.evidence.map(function (e) { return '<li><a href="' + e.url + '">' + esc(e.name) + '</a>: ' + esc(e.result) + '</li>'; }).join('') + '</ul>' : '') + '</li>';
      }).join('')));
    }
    card.appendChild(html('details', 'ai-more', '<summary>Where the AI ratings come from</summary><p>A rating is labelled by how many tests back it. One test only means a single source, so treat it as a hint. Related tests cover something close, such as JavaScript for TypeScript. Judgment means no current test covers it directly, and it rests on how much public code exists and how much happens in visual editors. Only sources from September 22, 2026 onward count, when Claude Opus 5.5 came out, because older results come from models that have since been replaced. Tests measure different things, so their scores can\'t be compared directly.</p><div class="compare-table"><table><thead><tr><th scope="col">Test</th><th scope="col">What it tests</th><th scope="col">How it scores</th><th scope="col">Newest models</th><th scope="col">Date</th></tr></thead><tbody>' + StackKit.aiBenches().map(function (b) { return '<tr><th scope="row"><a href="' + b.url + '">' + esc(b.name) + '</a></th><td>' + esc(b.tests) + '</td><td>' + esc(b.scored) + '</td><td>' + esc(b.models) + '</td><td>' + esc(b.date) + '</td></tr>'; }).join('') + '</tbody></table></div>'));
    return card;
  }

  function renderFlow(w) {
    var flow = document.getElementById('flow');
    flow.innerHTML = '';
    var views = stageViews(w);
    var tracker = document.createElement('ol');
    tracker.className = 'stages';
    tracker.setAttribute('aria-label', 'Stages');
    var STATE = { done: 'Answered', now: 'Now', skipped: 'Skipped', later: '' };
    views.forEach(function (v) {
      var item = html('li', 'stage ' + v.status, '<span class="n">' + v.number + '. ' + esc(v.name) + '</span>' + (STATE[v.status] ? '<span class="s">' + STATE[v.status] + '</span>' : ''));
      if (v.status !== 'later') {
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        var jump = function () {
          var target = v.status === 'now' ? document.getElementById('current-question') : document.querySelector('[data-stage="' + v.number + '"]');
          if (target) target.scrollIntoView({ block: 'center' });
        };
        item.addEventListener('click', jump);
        item.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); jump(); } });
      }
      tracker.appendChild(item);
    });
    var panel = document.getElementById('stage-panel');
    panel.innerHTML = '';
    var stepsCard = html('div', 'panel-card', '<p class="panel-title">Your steps</p>');
    stepsCard.id = 'stage-card';
    stepsCard.appendChild(tracker);
    panel.appendChild(stepsCard);
    var aiLines = w.current ? StackKit.aiNote(w.current.node.id) : [];
    if (aiLines.length) panel.appendChild(html('div', 'panel-chat', '<svg class="panel-figure" viewBox="0 0 16 13" width="48" height="39" aria-hidden="true" shape-rendering="crispEdges"><path fill="#d97757" d="M3 1h10v2h2v3h-2v3H3V6H1V3h2z"/><path fill="#d97757" d="M4 9h1v3H4zM7 9h1v3H7zM9 9h1v3H9zM11 9h1v3h-1z"/><path fill="#1a1a1a" d="M5 3h1v2H5zM10 3h1v2h-1z"/></svg><div class="panel-card panel-ai"><p class="panel-title">With AI</p><ul>' + aiLines.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' + benchNote(w.current) + '</div>'));
    var answeredList = document.createElement('div');
    answeredList.className = 'answered-list';
    if (w.path.length) flow.appendChild(answeredList);
    function answeredRow(step) {
      var row = html('div', 'answered', '<span class="q">' + esc(step.node.title) + '</span><strong class="a">' + esc(nameList(step.node, step.options, answers[step.node.id])) + '</strong>' + answeredUsedBy(step));
      var change = html('button', 'change', 'Change');
      change.type = 'button';
      change.addEventListener('click', function () {
        stopEditing(false);
        editing = step.node.id;
        var was = answers[step.node.id];
        editOriginal = Array.isArray(was) ? was.slice() : was;
        if (step.node.multi) multiOpen[step.node.id] = true;
        update();
        var head = document.getElementById('current-question');
        if (head) head.scrollIntoView();
      });
      row.appendChild(change);
      answeredList.appendChild(row);
    }
    views.forEach(function (v) {
      if (v.status === 'later') return;
      if (v.status === 'skipped') {
        var skippedNote = html('div', 'skipped-stage', '<span class="tag">Skipped</span>' + skipLine(v));
        skippedNote.setAttribute('data-stage', v.number);
        answeredList.appendChild(skippedNote);
        return;
      }
      var labelled = false;
      function label() {
        if (labelled) return;
        labelled = true;
        var stageLabel = html('p', 'stage-label', 'Stage ' + v.number + ': ' + esc(v.name));
        stageLabel.setAttribute('data-stage', v.number);
        answeredList.appendChild(stageLabel);
      }
      v.entries.forEach(function (e) {
        if (e.step) { label(); answeredRow(e.step); return; }
        var why = Tree.nodeSkipReason(e.node.id, answers);
        if (why) { label(); answeredList.appendChild(html('div', 'skipped-q', '<span class="tag">Not asked</span><span class="q">' + esc(e.node.title) + '</span><span class="why">' + esc(why) + '</span>')); }
      });
    });
    if (!w.current) return;
    var n = w.current.node;
    var box = document.createElement('section');
    box.className = 'current';
    var jumped = skippedSince(views, w);
    if (jumped.length && !editing) box.appendChild(html('aside', 'skip-note', '<p><span class="tag">Skipped to get here</span></p><ul>' + jumped.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>'));
    box.appendChild(html('p', 'qnum', 'Stage ' + (Tree.STAGE_ORDER.indexOf(n.stage) + 1) + ' of ' + Tree.STAGE_ORDER.length + ': ' + esc(Tree.STAGES[n.stage])));
    var head = html('h3', '', esc(n.title));
    head.id = 'current-question';
    head.tabIndex = -1;
    box.appendChild(head);
    if (n.why) box.appendChild(html('p', '', n.why));
    var compare = compareCard(n.id);
    if (compare) box.appendChild(compare);
    var later = editing ? laterAnswerCount(n.id) : 0;
    if (later) box.appendChild(html('aside', 'note warn', '<p><span class="tag">Later choices</span>Choosing here clears ' + (later === 1 ? 'the 1 choice' : 'all ' + later + ' choices') + ' you made after this question, and you\'ll answer ' + (later === 1 ? 'it' : 'them') + ' again from the next step. To leave everything as it is, use <strong>Keep current answer</strong>.</p>'));
    var suggestion = n.suggest ? n.suggest(answers) : null;
    if (suggestion) {
      var pickedOpt = w.current.options.filter(function (x) { return x.id === suggestion[0]; })[0];
      if (pickedOpt) box.appendChild(html('aside', 'start', '<p><span class="tag">Suggestion</span><strong>' + esc(pickedOpt.name) + '.</strong> ' + suggestion[1] + '</p>'));
    }
    var note = n.hiddenNote ? n.hiddenNote(answers) : '';
    if (note) box.appendChild(html('p', 'hidden-note', esc(note)));
    var grid = null, group = null;
    w.current.options.forEach(function (opt) {
      opt = Object.assign({}, opt, { start: !!suggestion && suggestion[0] === opt.id });
      if (!grid || opt.group !== group) {
        group = opt.group;
        if (group) box.appendChild(html('p', 'group-label', esc(group)));
        grid = document.createElement('div');
        grid.className = 'opts' + (n.noCompare ? ' compact' : '');
        box.appendChild(grid);
      }
      grid.appendChild(optionCard(n, opt));
    });
    if (n.multi) {
      var go = html('button', 'continue', 'Continue');
      go.type = 'button';
      go.disabled = !n.allowEmpty && !(answers[n.id] && answers[n.id].length);
      go.addEventListener('click', function () {
        if (!answers[n.id]) answers[n.id] = [];
        if (editing) clearAfter(n.id);
        stopEditing(true);
        multiOpen[n.id] = false;
        save(); update(); focusCurrent();
      });
      box.appendChild(go);
    }
    if (editing) {
      var cancel = html('button', 'change', 'Keep current answer');
      cancel.type = 'button';
      cancel.addEventListener('click', function () { stopEditing(false); save(); update(); focusCurrent(); });
      box.appendChild(cancel);
    }
    flow.appendChild(box);
  }
  function focusCurrent() {
    var head = document.getElementById('current-question') || document.getElementById('flow-done');
    if (!head) return;
    head.focus({ preventScroll: true });
    (document.querySelector('.current .skip-note') || document.querySelector('#plan .skip-note') && document.getElementById('plan') || head).scrollIntoView();
  }
  function optionCard(n, opt) {
    var card = document.createElement('article');
    card.className = 'opt';
    var chosen = n.multi ? (answers[n.id] || []).indexOf(opt.id) >= 0 : answers[n.id] === opt.id;
    if (chosen) card.classList.add('chosen');
    card.appendChild(html('h4', '', esc(opt.name) + (opt.start ? ' <span class="chip partial">Suggested</span>' : '')));
    var fit = StackKit.aiFit(n.id, opt.id);
    if (fit) card.appendChild(html('p', 'ai-fit ' + fit.level, '<span>AI support: ' + fitLabel(fit) + '</span> ' + esc(fit.why) + '.' + (fit.evidence.length ? '<ul class="ai-tests">' + fit.evidence.map(function (e) { return '<li><a href="' + e.url + '">' + esc(e.name) + '</a>: ' + esc(e.result) + '</li>'; }).join('') + '</ul>' : '')));
    var oldDoc = docsFor(n.id, opt.id);
    if (docsOld(oldDoc)) card.appendChild(html('p', 'note warn', '<span class="tag">Older docs</span>The newest official docs for this with your choices are from ' + oldDoc.d.slice(0, 4) + ', before 2026, so check that it still works. <a href="' + oldDoc.u + '">' + esc(oldDoc.src) + '</a>'));
    var used = StackKit.usedBy(n.id, opt.id);
    if (used) card.appendChild(html('p', 'used-by', '<span>Who uses it</span> ' + esc(used)));
    var label = n.multi ? (chosen ? 'Added' : 'Add') : (chosen ? 'Your choice' : 'Choose this');
    var b = html('button', 'choose', label);
    b.type = 'button';
    b.setAttribute('aria-pressed', chosen ? 'true' : 'false');
    b.addEventListener('click', function () {
      if (n.multi) {
        var list = (answers[n.id] || []).slice(), i = list.indexOf(opt.id);
        if (i >= 0) list.splice(i, 1); else list.push(opt.id);
        answers[n.id] = list;
        multiOpen[n.id] = true;
        if (!editing) save();
        update();
      } else {
        if (editing || answers[n.id] !== opt.id) clearAfter(n.id);
        answers[n.id] = opt.id;
        stopEditing(true);
        save(); update(); focusCurrent();
      }
    });
    card.appendChild(b);
    card.appendChild(html('p', '', opt.sum));
    if (opt.pros && opt.cons) {
      var li = function (t) { return '<li>' + t + '</li>'; };
      var pros = opt.pros, cons = opt.cons;
      if (fit && fit.level === 'limited') cons = ['Weak AI support'].concat(cons);
      else if (fit) pros = [fit.level === 'strong' ? 'Strong AI support' : 'Good AI support'].concat(pros);
      card.appendChild(html('div', 'pc', '<div><p class="pc-h pro">Pros</p><ul>' + pros.map(li).join('') + '</ul></div><div><p class="pc-h con">Cons</p><ul>' + cons.map(li).join('') + '</ul></div>'));
    }
    if (opt.url) card.appendChild(html('p', 'docs', '<a href="' + opt.url + '">Official docs</a>'));
    return card;
  }

  function adrText(step) {
    var n = step.node, val = answers[n.id];
    var chosen = step.options.filter(function (o) { return n.multi ? val.indexOf(o.id) >= 0 : o.id === val; });
    var strip = function (t) { return t.replace(/<[^>]+>/g, ''); };
    var names = chosen.map(function (o) { return o.name; }).join(', ');
    var pros = [], cons = [];
    chosen.forEach(function (o) { pros = pros.concat(o.pros || []); cons = cons.concat(o.cons || []); });
    var today = new Date().toISOString().slice(0, 10);
    return '# ADR: ' + n.title + '\n\nDecision: ' + names + '\nStatus: Proposed\nDate: ' + today + '\n\n## Context\nAdd your constraints here, such as budget, team skills and deadlines.\n\n## Options considered\n' + step.options.map(function (o) { return '- ' + o.name; }).join('\n') + '\n\n## Decision\nUse ' + names + '. Add your main reason here.\n\n## Consequences\nBenefits:\n' + pros.map(function (t) { return '- ' + strip(t); }).join('\n') + '\n\nCosts we accept:\n' + cons.map(function (t) { return '- ' + strip(t); }).join('\n') + '\n';
  }

  function renderAfter(w, complete, showGuide, hasStackGuide) {
    var after = document.getElementById('after-flow');
    after.hidden = !complete;
    var plan = document.getElementById('plan');
    plan.innerHTML = '';
    plan.hidden = !complete;
    var drafts = document.getElementById('adr-drafts');
    drafts.innerHTML = '';
    if (!complete) return;
    plan.appendChild(html('h3', '', '<span id="flow-done" tabindex="-1">Your plan</span>'));
    var skippedStages = stageViews(w).filter(function (v) { return v.status === 'skipped'; });
    if (skippedStages.length) plan.appendChild(html('aside', 'skip-note', '<p><span class="tag">Skipped stages</span>' + skippedStages.length + ' of ' + Tree.STAGE_ORDER.length + ' stages don\'t apply to this plan.</p><ul>' + skippedStages.map(function (v) { return '<li>' + skipLine(v) + '</li>'; }).join('') + '</ul>'));
    plan.appendChild(aiCard(w));
    if (showGuide) {
      plan.appendChild(html('p', '', 'All the required choices are made. The setup steps follow below.'));
      if (answers.framework === 'spring-boot') {
        var tested = html('p', '', '<strong>What has been tested for this stack:</strong> ');
        w.path.forEach(function (step) {
          var c = chip(step.node.id + ':' + answers[step.node.id]);
          var st = STATUS[step.node.id + ':' + answers[step.node.id]], doc = st && st.l !== 'run' ? docsFor(step.node.id, answers[step.node.id]) : null;
          if (c) tested.innerHTML += esc(nameList(step.node, step.options, answers[step.node.id])) + ' ' + c + (doc ? ' <a href="' + doc.u + '">' + (docsOld(doc) ? 'docs from ' + doc.d.slice(0, 4) + ', before 2026' : 'official docs, ' + doc.d.slice(0, 4)) + '</a>' : '') + ' ';
        });
        plan.appendChild(tested);
      }
    } else if (hasStackGuide) {
      plan.appendChild(html('p', '', 'All the required choices are made. The setup steps follow below.'));
    } else {
      plan.appendChild(html('aside', 'note warn', '<p><span class="tag">Next steps</span>Work through the official docs below, in this order. Full guides exist so far for Next.js, Express, ASP.NET Core, FastAPI, Flask, Django, NestJS, Fastify, Go, Quarkus, Micronaut, Jakarta EE, Spring Boot and the ready-made platforms, and none of these choices have been run for this plan.</p>'));
      var list = document.createElement('ol');
      list.className = 'plain';
      w.path.forEach(function (step) {
        var vals = step.node.multi ? answers[step.node.id] : [answers[step.node.id]];
        step.options.filter(function (o) { return vals.indexOf(o.id) >= 0; }).forEach(function (o) {
          if (step.node.noCompare || step.node.stage === 'requirements') return;
          var li = document.createElement('li');
          li.innerHTML = '<strong>' + esc(o.name) + '</strong>' + (o.url ? ': <a href="' + o.url + '">official docs</a>' : '');
          list.appendChild(li);
        });
      });
      plan.appendChild(list);
    }
    w.path.forEach(function (step) {
      if (step.node.noCompare) return;
      var d = document.createElement('details');
      d.className = 'adr-draft';
      d.appendChild(html('summary', '', esc(step.node.title)));
      d.appendChild(codeBox(adrText(step), null));
      drafts.appendChild(d);
    });
  }

  function renderStaticCode(s) {
    var gradle = s.build === 'gradle';
    document.querySelectorAll('main code:not([data-dyn])').forEach(function (el) {
      if (el.dataset.orig === undefined) {
        el.dataset.orig = el.textContent;
        el.dataset.lang = (el.className.match(/language-([\w-]+)/) || [])[1] || '';
      }
      var orig = el.dataset.orig, next = gradle ? devtoolsGradle(toGradle(orig)) : orig;
      var isBlock = el.parentElement.tagName === 'PRE';
      if (el.dataset.done === next && (!isBlock || el.dataset.hl)) return;
      el.dataset.done = next;
      el.textContent = next;
      if (isBlock && el.dataset.lang) {
        var lang = (gradle && next.indexOf('developmentOnly') === 0) ? 'kotlin' : el.dataset.lang;
        el.className = 'language-' + lang;
        highlight(el, lang);
        el.dataset.hl = '1';
      }
    });
  }

  function renderGuide() {
    var pick = {};
    ['framework', 'build', 'frontend', 'api', 'database', 'data', 'migrations', 'login', 'admin', 'hosting', 'transport', 'payment'].forEach(function (k) { if (answers[k]) pick[k] = answers[k]; });
    if (pick.database === 'mongodb') { pick.data = 'mongo'; pick.migrations = 'none'; }
    if (!pick.login) pick.login = 'none';
    if (!pick.admin) pick.admin = 'none';
    if (!pick.frontend) pick.frontend = 'thymeleaf';
    var plan = Recipes.plan(pick), s = plan.s, gradle = s.build === 'gradle';
    var warn = document.getElementById('plan');
    plan.warnings.forEach(function (t) { warn.appendChild(html('aside', 'note warn', '<p><span class="tag">Check this</span>' + t + '</p>')); });

    document.querySelectorAll('[data-show]').forEach(function (el) { el.hidden = !evalShow(el.dataset.show, s); });

    var d7 = document.getElementById('dyn-deps');
    d7.innerHTML = '';
    if (plan.setup.length) { d7.appendChild(html('h4', 'sub', 'Set up the database')); renderItems(plan.setup, d7, gradle); }
    d7.appendChild(html('h4', 'sub', 'Add the dependencies'));
    d7.appendChild(html('p', '', gradle ? 'Add these inside <code>dependencies { }</code> in <code>build.gradle.kts</code>:' : 'Add these inside <code>&lt;dependencies&gt;</code> in <code>pom.xml</code>:'));
    d7.appendChild(codeBox(depBlock(plan.deps, gradle), gradle ? 'kotlin' : 'xml'));
    d7.appendChild(dl(plan.deps.map(function (d) { return [d.a, d.why]; })));
    d7.appendChild(html('h4', 'sub', 'Add the settings'));
    d7.appendChild(html('p', '', 'Add these lines to <code>src/main/resources/application.properties</code>:'));
    d7.appendChild(codeBox(plan.props.map(function (p) { return p[0] + '=' + p[1]; }).join('\n'), 'ini'));
    d7.appendChild(dl(plan.props.map(function (p) { return [p[0], p[2]]; })));

    var d8 = document.getElementById('dyn-feature');
    d8.innerHTML = '';
    renderItems(plan.feature, d8, gradle);
    if (s.api === 'grpc') d8.appendChild(html('p', '', 'With gRPC there\'s no web controller here. Add your service from the <a href="https://spring.io/projects/spring-grpc">Spring gRPC guide</a>.'));
    if (plan.frontend.length) {
      d8.appendChild(html('h4', 'sub', 'Create the frontend'));
      renderItems(plan.frontend, d8, gradle);
    }
    var d9 = document.getElementById('dyn-tests');
    d9.innerHTML = '';
    if (plan.tests.length) renderItems(plan.tests, d9, gradle);
    else d9.appendChild(html('p', '', 'Your choices have no controller test on this page. <code>DemoApplicationTests</code> still checks that the app can start.'));
    if (s.database !== 'h2') d9.appendChild(html('aside', 'note warn', '<p><span class="tag">Watch out</span><code>DemoApplicationTests</code> starts the whole app, so your database has to be running for <code>' + (gradle ? './gradlew test' : './mvnw test') + '</code> to pass.</p>'));
    var login = document.getElementById('dyn-login'); login.innerHTML = ''; renderItems(plan.login, login, gradle);
    var admin = document.getElementById('dyn-admin'); admin.innerHTML = ''; renderItems(plan.admin, admin, gradle);
    var deploy = document.getElementById('dyn-deploy'); deploy.innerHTML = ''; renderItems(plan.deploy, deploy, gradle);
    var extras = document.getElementById('dyn-extras');
    if (!extras) {
      extras = document.createElement('div');
      extras.id = 'dyn-extras';
      document.getElementById('step-11').insertAdjacentElement('beforebegin', extras);
    }
    extras.innerHTML = '';
    plan.extras.forEach(function (extra) {
      var head = html('h3', '', esc(extra.title));
      head.id = extra.id;
      extras.appendChild(head);
      renderItems(extra.items, extras, gradle);
    });
    renumberSteps(pick);
    var other = document.getElementById('other-name');
    if (other) other.textContent = { quarkus: 'Quarkus', micronaut: 'Micronaut', 'jakarta-ee': 'Jakarta EE' }[s.framework] || '';
    renderStaticCode(s);
  }

  // Hides the login and admin steps when they aren't needed, then closes the gap in the step numbers.
  function renumberSteps(pick) {
    var hide = { 'step-login': pick.login === 'none', 'step-admin': pick.admin === 'none' };
    ['step-login', 'dyn-login', 'step-admin', 'dyn-admin'].forEach(function (id) {
      var key = id === 'dyn-login' ? 'step-login' : id === 'dyn-admin' ? 'step-admin' : id;
      document.getElementById(id).hidden = hide[key];
    });
    var num = 11;
    ['step-login', 'step-admin', 'step-11', 'step-deploy'].forEach(function (id) {
      var h = document.getElementById(id);
      if (h.hidden) return;
      h.textContent = h.textContent.replace(/^Step \d+/, 'Step ' + num);
      num++;
    });
  }

  // Which options were actually run, from the real projects built from these guides.
  function optionStatus(step) {
    var fw = answers.framework || answers.siteStack, ran = (STACK_STATUS.ran[fw] || {})[step.node.id] || [];
    var vals = step.node.multi ? answers[step.node.id] : [answers[step.node.id]];
    return vals.filter(function (v) { return !(step.node.id === 'siteStack' && v === 'custom'); }).map(function (v) {
      var o = step.options.filter(function (x) { return x.id === v; })[0];
      var name = o ? o.name : v;
      var partial = STACK_STATUS.partial[step.node.id + ':' + v];
      if (((STACK_STATUS.browser[fw] || {})[step.node.id] || []).indexOf(v) >= 0) return '<li>' + esc(name) + ': <span class="ran">Ran</span> and was used in a real browser, in an app built from this guide.</li>';
      if (ran.indexOf(v) < 0) {
        var sib = (SIBLINGS[fw] || []).filter(function (f) { return (((STACK_STATUS.ran[f] || {})[step.node.id]) || []).indexOf(v) >= 0; })[0];
        if (sib) return '<li>' + esc(name) + ': <span class="ran">Ran</span> with ' + FW_NAME[sib] + ', which shares this code. Not run with ' + FW_NAME[fw] + '.</li>';
        return '<li>' + esc(name) + ': <span class="no">Not run.</span> ' + docsLine(docsFor(step.node.id, v)) + '</li>';
      }
      if (partial) return '<li>' + esc(name) + ': <span class="part">Partly run.</span> ' + partial + '</li>';
      return '<li>' + esc(name) + ': <span class="ran">Ran</span> in a real project built from this guide.</li>';
    }).join('');
  }
  function renderStackGuide(w) {
    var box = document.getElementById('stack-guide');
    box.innerHTML = '';
    var sections = StackKit.plan(answers);
    if (!sections) return false;
    box.appendChild(html('p', 'part', 'Part 2'));
    var title = html('h2', '', 'Build it');
    title.id = 'build-it';
    box.appendChild(title);
    box.appendChild(html('p', '', 'These are the setup steps. They follow your choices, in order. Every command and file is here, with what each part does. It builds a small task list, so you can see every layer working before you add your own features.'));
    var combo = comboDocs(answers);
    var migStep = w.path.filter(function (s) { return s.node.id === 'migrations'; })[0];
    var migName = migStep ? nameList(migStep.node, migStep.options, answers.migrations) : answers.migrations;
    var rows = w.path.filter(function (step) { return !step.node.noCompare && ['siteStack', 'contentSource', 'frontend', 'frontendLanguage', 'api', 'database', 'data', 'migrations', 'login', 'admin', 'transport', 'payment', 'build', 'framework'].indexOf(step.node.id) >= 0; }).map(optionStatus).join('') + (combo ? '<li>' + esc(migName) + ' with SQL Server: ' + docsLine(combo) + '</li>' : '');
    box.appendChild(html('div', 'stack-status', '<p><strong>What was tested for your choices, and what rests on official docs.</strong> Each option below was tested on its own or in some combinations, on Windows with Git Bash, but this exact combination may not have been. Where an option wasn\'t run, it rests on official docs from 2026 or later that say it\'s supported.' + (answers.language === 'csharp' ? ' The ASP.NET Core styles share most of their code, so a result can come from another style.' : '') + '</p><ul class="plain">' + rows + '</ul>'));
    var contents = document.createElement('ol');
    contents.className = 'plain stack-contents';
    sections.forEach(function (s) { contents.appendChild(html('li', '', '<a href="#s-' + s.id + '">' + esc(s.title) + '</a>')); });
    box.appendChild(contents);
    sections.forEach(function (s, i) {
      var head = html('h3', '', 'Step ' + (i + 1) + ': ' + esc(s.title));
      head.id = 's-' + s.id;
      box.appendChild(head);
      renderItems(s.items, box, false);
    });
    var docs = w.path.reduce(function (list, step) {
      var vals = step.node.multi ? answers[step.node.id] : [answers[step.node.id]];
      step.options.forEach(function (o) { if (vals.indexOf(o.id) >= 0 && o.url && !step.node.noCompare) list.push('<li><a href="' + o.url + '">' + esc(o.name) + '</a></li>'); });
      return list;
    }, []);
    box.appendChild(html('h3', '', 'Official docs for your choices'));
    box.appendChild(html('ul', 'plain', docs.join('')));
    return true;
  }
  function update() {
    var w = walk();
    var complete = !w.current;
    renderFlow(w);
    var hasStackGuide = complete && answers.product === 'website' && (answers.framework ? !!StackKit.frameworks[answers.framework] && !(StackKit.noGuideYet && StackKit.noGuideYet(answers)) : !!StackKit.ready[answers.siteStack]);
    var showGuide = complete && !hasStackGuide && answers.language === 'java' && Tree.isCustomWeb(answers);
    renderAfter(w, complete, showGuide, hasStackGuide);
    var stackBox = document.getElementById('stack-guide');
    stackBox.hidden = !hasStackGuide;
    if (hasStackGuide) renderStackGuide(w); else stackBox.innerHTML = '';
    document.getElementById('flow-reset').hidden = !w.path.length;
    document.getElementById('guide').hidden = !showGuide;
    if (showGuide) renderGuide();
    var stagePanel = document.getElementById('stage-card');
    [['Your plan', complete ? 'plan' : ''], ['AI support', complete ? 'ai-support' : ''], ['Setup steps', hasStackGuide ? 'stack-guide' : showGuide ? 'guide' : '']].forEach(function (link) {
      if (!link[1]) return;
      var go = html('button', 'panel-link', link[0]);
      go.type = 'button';
      go.addEventListener('click', function () { document.getElementById(link[1]).scrollIntoView(); });
      stagePanel.appendChild(go);
    });
  }

  document.getElementById('flow-reset').addEventListener('click', function () {
    answers = {}; editing = null; editOriginal = null; multiOpen = {}; save(); update(); document.getElementById('stack').scrollIntoView();
  });

  document.querySelectorAll('.code').forEach(addCopy);
  document.querySelectorAll('code[data-dyn][class*="language-"]').forEach(function (el) {
    highlight(el, el.className.replace('language-', ''));
  });
  update();

  document.querySelector('main').addEventListener('click', function (event) {
    var a = event.target.closest && event.target.closest('a[href^="#"]');
    if (!a) return;
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if (t) { event.preventDefault(); t.scrollIntoView(); }
  });
})();
