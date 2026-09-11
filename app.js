/* =========================================================
   365 -> CYBERSECURITY JOB READY -- app.js
   ========================================================= */
(function(){
  "use strict";

  var DATA = JSON.parse(document.getElementById('curriculum-data').textContent);
  var DAYS = DATA.days;
  var PHASES = DATA.phases;
  var TOTAL = DATA.meta.totalDays;

  var LS_KEY = "ccjr_progress_v1";

  function loadState(){
    try{
      var raw = localStorage.getItem(LS_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    return { completed:{}, notes:{}, lastActive:null };
  }
  function saveState(){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){}
  }
  var state = loadState();
  if(!state.completed) state.completed = {};
  if(!state.notes) state.notes = {};

  // -----------------------------------------------------
  // Skill mapping: phase id(s) -> skill label
  // -----------------------------------------------------
  var SKILLS = [
    { key:"networking", label:"Networking", phases:[1] },
    { key:"linux", label:"Linux", phases:[2] },
    { key:"windows", label:"Windows / AD", phases:[3] },
    { key:"foundations", label:"Cyber Foundations", phases:[4] },
    { key:"soc", label:"SOC / Blue Team", phases:[5] },
    { key:"siem", label:"SIEM / Wazuh", phases:[6] },
    { key:"ir", label:"Incident Response", phases:[7] },
    { key:"pentest", label:"Pentesting / Web", phases:[8] },
    { key:"netsec", label:"Network Security", phases:[9] },
    { key:"cloud", label:"Cloud / Automation", phases:[10] },
    { key:"jobready", label:"Job Readiness", phases:[11] },
  ];

  function daysInPhases(phaseIds){
    return DAYS.filter(function(d){ return phaseIds.indexOf(d.phase) !== -1; });
  }
  function completedCount(dayObjs){
    var n = 0;
    dayObjs.forEach(function(d){ if(state.completed[d.day]) n++; });
    return n;
  }

  // -----------------------------------------------------
  // NAV
  // -----------------------------------------------------
  var navButtons = document.querySelectorAll('.navlinks button');
  navButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = document.getElementById(btn.dataset.target);
      if(target) target.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });

  var sections = Array.prototype.map.call(document.querySelectorAll('section[id]'), function(s){ return s; });
  function updateActiveNav(){
    var y = window.scrollY + 100;
    var current = sections[0];
    sections.forEach(function(s){ if(s.offsetTop <= y) current = s; });
    navButtons.forEach(function(btn){
      btn.classList.toggle('active', btn.dataset.target === current.id);
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive:true });

  // -----------------------------------------------------
  // STREAK CALC (based on consecutive completed day-numbers ending at highest completed day)
  // -----------------------------------------------------
  function computeStreaks(){
    var completedDays = Object.keys(state.completed).filter(function(k){ return state.completed[k]; }).map(Number).sort(function(a,b){ return a-b; });
    if(completedDays.length === 0) return { current:0, longest:0, doneCount:0 };
    var longest = 1, run = 1;
    for(var i=1;i<completedDays.length;i++){
      if(completedDays[i] === completedDays[i-1] + 1){ run++; } else { run = 1; }
      if(run > longest) longest = run;
    }
    // current streak = consecutive run ending at the max completed day
    var maxDay = completedDays[completedDays.length-1];
    var cur = 1, d = maxDay;
    while(state.completed[d-1]){ cur++; d--; }
    return { current:cur, longest:longest, doneCount:completedDays.length };
  }

  // -----------------------------------------------------
  // RENDER: HERO STATS
  // -----------------------------------------------------
  function nextUnfinishedDay(){
    for(var i=1;i<=TOTAL;i++){ if(!state.completed[i]) return i; }
    return TOTAL;
  }

  function renderHero(){
    var s = computeStreaks();
    document.getElementById('stat-done').textContent = s.doneCount;
    document.getElementById('stat-streak').textContent = s.current;
    document.getElementById('stat-pct').textContent = Math.round((s.doneCount/TOTAL)*100) + '%';
    var nd = nextUnfinishedDay();
    var phaseOfNd = DAYS[nd-1].phaseName;
    document.getElementById('stat-phase').textContent = 'P' + DAYS[nd-1].phase;
    document.getElementById('nav-streak-num').textContent = s.current;
    var resumeBtn = document.getElementById('resume-btn');
    resumeBtn.textContent = s.doneCount === 0 ? 'Start Day 1' : ('Resume — Day ' + nd);
    resumeBtn.onclick = function(){ openDay(nd); };
  }

  // -----------------------------------------------------
  // RENDER: DASHBOARD RING + SKILLS
  // -----------------------------------------------------
  function renderDashboard(){
    var s = computeStreaks();
    var pct = Math.round((s.doneCount/TOTAL)*100);
    var circle = document.getElementById('ring-fill');
    var r = 80, circumference = 2*Math.PI*r;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference - (pct/100)*circumference;
    document.getElementById('ring-pct').textContent = pct + '%';
    document.getElementById('ring-days').innerHTML = '<b>' + s.doneCount + '</b> / ' + TOTAL + ' days logged';

    document.getElementById('chip-current').textContent = s.current;
    document.getElementById('chip-longest').textContent = s.longest;
    document.getElementById('chip-remaining').textContent = TOTAL - s.doneCount;

    var skillWrap = document.getElementById('skill-list');
    skillWrap.innerHTML = '';
    SKILLS.forEach(function(sk){
      var dobjs = daysInPhases(sk.phases);
      var done = completedCount(dobjs);
      var pctv = dobjs.length ? Math.round((done/dobjs.length)*100) : 0;
      var row = document.createElement('div');
      row.className = 'skill-row';
      row.innerHTML =
        '<span class="skill-name">'+sk.label+'</span>'+
        '<span class="skill-bar-track"><span class="skill-bar-fill" style="width:'+pctv+'%"></span></span>'+
        '<span class="skill-pct">'+pctv+'%</span>';
      skillWrap.appendChild(row);
    });
  }

  // -----------------------------------------------------
  // RENDER: ROADMAP (phases)
  // -----------------------------------------------------
  function renderRoadmap(){
    var wrap = document.getElementById('roadmap-list');
    wrap.innerHTML = '';
    PHASES.forEach(function(p){
      var dobjs = DAYS.filter(function(d){ return d.phase === p.id; });
      var done = completedCount(dobjs);
      var pct = dobjs.length ? Math.round((done/dobjs.length)*100) : 0;
      var projectDay = dobjs.find(function(d){ return d.portfolio; });
      var learningTopics = dobjs.filter(function(d){ return d.type === 'learning'; }).map(function(d){ return d.topic; });
      var uniqTopics = learningTopics.slice(0, 14);

      var card = document.createElement('div');
      card.className = 'phase-card';
      card.innerHTML =
        '<div class="phase-num">Phase<b>'+String(p.id).padStart(2,'0')+'</b></div>'+
        '<div class="phase-body">'+
          '<div class="phase-top"><h3>'+p.name+'</h3><span class="phase-days mono">Days '+p.start+'\u2013'+p.end+' \u00b7 '+p.days+' days</span></div>'+
          '<div class="phase-bar-track"><span class="phase-bar-fill" style="width:'+pct+'%"></span></div>'+
          '<div class="phase-meta-row"><span>'+done+'/'+dobjs.length+' completed</span><span>'+pct+'% done</span></div>'+
          (projectDay ? '<span class="phase-project-tag">Portfolio project \u00b7 Day '+projectDay.day+'</span>' : '')+
          '<div class="phase-topics"><ul>'+uniqTopics.map(function(t){ return '<li>'+escapeHtml(t)+'</li>'; }).join('')+'</ul></div>'+
        '</div>';
      card.addEventListener('click', function(e){
        card.classList.toggle('open');
      });
      wrap.appendChild(card);
    });
  }

  // -----------------------------------------------------
  // ESCAPE / helpers
  // -----------------------------------------------------
  function escapeHtml(str){
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // -----------------------------------------------------
  // EXPLORER: filters + list
  // -----------------------------------------------------
  var elSearch = document.getElementById('search-input');
  var elPhaseFilter = document.getElementById('filter-phase');
  var elTypeFilter = document.getElementById('filter-type');
  var elIncompleteOnly = document.getElementById('filter-incomplete');
  var elList = document.getElementById('day-list');
  var elCount = document.getElementById('explorer-count');

  function populatePhaseFilter(){
    PHASES.forEach(function(p){
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = 'Phase ' + p.id + ' \u2014 ' + p.name;
      elPhaseFilter.appendChild(opt);
    });
  }

  var TYPE_LABELS = {
    "learning":"Learning", "lab":"Lab", "review":"Review", "exam":"Exam",
    "project":"Project", "job-prep":"Job Prep", "final-project":"Final Project"
  };

  function renderExplorer(){
    var q = elSearch.value.trim().toLowerCase();
    var phaseVal = elPhaseFilter.value;
    var typeVal = elTypeFilter.value;
    var incompleteOnly = elIncompleteOnly.checked;

    var filtered = DAYS.filter(function(d){
      if(phaseVal !== 'all' && String(d.phase) !== phaseVal) return false;
      if(typeVal !== 'all' && d.type !== typeVal) return false;
      if(incompleteOnly && state.completed[d.day]) return false;
      if(q){
        var hay = (d.day + ' ' + d.topic + ' ' + d.phaseName + ' ' + d.tool).toLowerCase();
        if(hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    elCount.textContent = filtered.length + ' of ' + TOTAL + ' days shown';
    elList.innerHTML = '';

    if(filtered.length === 0){
      elList.innerHTML = '<div class="empty-state">No days match these filters. Try clearing search or filters.</div>';
      return;
    }

    var frag = document.createDocumentFragment();
    filtered.forEach(function(d){
      var row = document.createElement('div');
      var isDone = !!state.completed[d.day];
      row.className = 'day-row' + (isDone ? ' completed' : '');
      row.innerHTML =
        '<span class="dnum mono">D'+d.day+'</span>'+
        '<span class="dinfo">'+
          '<span class="dtopic">'+escapeHtml(d.topic)+'</span>'+
          '<span class="dmeta"><span class="type-tag type-'+d.type+'">'+TYPE_LABELS[d.type]+'</span><span>'+escapeHtml(d.phaseName)+'</span><span>'+d.difficulty+'</span></span>'+
        '</span>'+
        '<button class="dcheck'+(isDone?' checked':'')+'" title="Mark complete" aria-label="Mark day '+d.day+' complete">'+(isDone?'\u2713':'')+'</button>'+
        '<button class="dgo" title="Open day" aria-label="Open day '+d.day+'">\u203a</button>';

      row.querySelector('.dcheck').addEventListener('click', function(e){
        e.stopPropagation();
        toggleComplete(d.day);
      });
      row.addEventListener('click', function(){ openDay(d.day); });
      frag.appendChild(row);
    });
    elList.appendChild(frag);
  }

  [elSearch, elPhaseFilter, elTypeFilter].forEach(function(el){
    el.addEventListener('input', renderExplorer);
    el.addEventListener('change', renderExplorer);
  });
  elIncompleteOnly.addEventListener('change', renderExplorer);

  // -----------------------------------------------------
  // COMPLETE TOGGLE
  // -----------------------------------------------------
  function toggleComplete(dayNum){
    state.completed[dayNum] = !state.completed[dayNum];
    saveState();
    renderAll();
    if(modalDay === dayNum) syncModalCompleteButton();
  }

  // -----------------------------------------------------
  // DAY DETAIL MODAL
  // -----------------------------------------------------
  var overlay = document.getElementById('modal-overlay');
  var modalDay = null;

  function openDay(dayNum){
    modalDay = dayNum;
    var d = DAYS[dayNum - 1];
    document.getElementById('modal-daytag').innerHTML =
      'DAY '+d.day+' / '+TOTAL+' &nbsp;\u00b7&nbsp; Phase '+d.phase+' \u2014 '+escapeHtml(d.phaseName)+' &nbsp;\u00b7&nbsp; Week '+d.week;
    document.getElementById('modal-title').textContent = d.topic;

    var tagsEl = document.getElementById('modal-tags');
    tagsEl.innerHTML =
      '<span class="tag-chip">'+TYPE_LABELS[d.type]+'</span>'+
      '<span class="tag-chip">'+d.difficulty+'</span>'+
      '<span class="tag-chip">'+escapeHtml(d.time)+'</span>'+
      '<span class="tag-chip">'+escapeHtml(d.tool)+'</span>';

    document.getElementById('modal-objectives').innerHTML = d.objectives.map(function(o){ return '<li>'+escapeHtml(o)+'</li>'; }).join('');
    document.getElementById('modal-theory').textContent = d.theory;
    document.getElementById('modal-practical').textContent = d.practical;
    document.getElementById('modal-challenge').textContent = d.challenge;
    document.getElementById('modal-knowledge').innerHTML = d.knowledgeCheck.map(function(k){ return '<li>'+escapeHtml(k)+'</li>'; }).join('');
    document.getElementById('modal-career').textContent = d.career;

    var engWrap = document.getElementById('modal-english');
    engWrap.innerHTML = d.english.words.map(function(w){
      return '<div class="english-word"><b>'+escapeHtml(w.term)+'</b><span class="pos">'+escapeHtml(w.pos)+'</span><span>\u2014 '+escapeHtml(w.meaning)+'</span></div>'+
             '<div style="font-size:12.5px;color:var(--text-faint);margin:-4px 0 6px 0;">"'+escapeHtml(w.example)+'"</div>';
    }).join('') + '<div class="english-phrase">Interview phrase: \u201c'+escapeHtml(d.english.interviewPhrase)+'\u201d</div>';

    var notesArea = document.getElementById('modal-notes');
    notesArea.value = state.notes[dayNum] || '';
    notesArea.oninput = function(){
      state.notes[dayNum] = notesArea.value;
      saveState();
    };

    syncModalCompleteButton();

    document.getElementById('modal-prev').disabled = dayNum <= 1;
    document.getElementById('modal-next').disabled = dayNum >= TOTAL;

    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
  }

  function syncModalCompleteButton(){
    var btn = document.getElementById('modal-complete-btn');
    var isDone = !!state.completed[modalDay];
    btn.textContent = isDone ? '\u2713 Marked complete' : 'Mark day complete';
    btn.classList.toggle('btn-primary', true);
    btn.style.opacity = isDone ? '0.75' : '1';
  }

  document.getElementById('modal-complete-btn').addEventListener('click', function(){
    toggleComplete(modalDay);
  });
  document.getElementById('modal-prev').addEventListener('click', function(){ if(modalDay > 1) openDay(modalDay - 1); });
  document.getElementById('modal-next').addEventListener('click', function(){ if(modalDay < TOTAL) openDay(modalDay + 1); });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('show')) closeModal();
  });
  function closeModal(){
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  // -----------------------------------------------------
  // RESET
  // -----------------------------------------------------
  document.getElementById('reset-progress').addEventListener('click', function(){
    if(confirm('Reset all progress and notes? This cannot be undone.')){
      state = { completed:{}, notes:{}, lastActive:null };
      saveState();
      renderAll();
    }
  });

  // -----------------------------------------------------
  // INIT
  // -----------------------------------------------------
  function renderAll(){
    renderHero();
    renderDashboard();
    renderRoadmap();
    renderExplorer();
  }

  populatePhaseFilter();
  renderAll();
  updateActiveNav();

})();
