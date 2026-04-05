export interface Chapter {
  id: number;
  title: string;
  content: string;
  duration?: string;
}

export interface CourseDataParams {
  courseTitle: string;
  instructorName: string;
  category?: string;
  chapters: Chapter[];
}

export const getCourseHtmlTemplate = ({
  courseTitle,
  instructorName,
  category = "Development",
  chapters,
}: CourseDataParams) => {
  const safeData = JSON.stringify({ courseTitle, instructorName, category, chapters });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${courseTitle}</title>
  <style>
    /* RESET & BASE */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #f9fafb;
      -webkit-font-smoothing: antialiased;
      overflow: hidden;
      height: 100vh;
    }
    .wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* 1. HEADER SECTION */
    .header-section {
      background-color: #111827;
      padding: 20px 16px;
      flex-shrink: 0;
    }
    .badge {
      display: inline-block;
      background-color: #1e3a5f;
      color: #60a5fa;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .course-title {
      font-size: 22px;
      color: #f9fafb;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 8px;
    }
    .course-subtitle {
      color: #94a3b8;
      font-size: 13px;
      font-weight: 500;
    }

    /* 2. PROGRESS BAR SECTION */
    .progress-section {
      background-color: #0f172a;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      flex-shrink: 0;
    }
    .progress-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 11px;
      font-weight: 600;
    }
    .progress-lbl-left { color: #94a3b8; }
    .progress-lbl-right { color: #3b82f6; }
    .progress-track {
      height: 8px;
      background-color: #1f2937;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
      width: 0%;
      border-radius: 4px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* SCROLLABLE CONTENT AREA */
    .scrollable-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      padding-bottom: 120px; /* Space for fixed bottom bar */
      display: flex;
      flex-direction: column;
      gap: 24px;
      -webkit-overflow-scrolling: touch;
    }

    /* 3. VIDEO PLACEHOLDER SECTION */
    .video-placeholder {
      background-color: #1a1a2e;
      border: 1px solid #2a2a4a;
      border-radius: 16px;
      height: 160px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }
    .play-btn {
      width: 56px;
      height: 56px;
      background-color: #4F46E5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      z-index: 2;
    }
    .play-btn:active { transform: scale(0.9); }
    .play-triangle {
      width: 0; 
      height: 0; 
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-left: 12px solid #fff;
      margin-left: 4px;
    }
    .video-text {
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      position: relative;
      z-index: 2;
    }
    .video-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(15, 23, 42, 0.95);
      color: #60a5fa;
      font-size: 15px;
      font-weight: 700;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      z-index: 3;
    }
    .video-placeholder.playing .video-overlay {
      opacity: 1;
      pointer-events: auto;
    }

    /* 4. VERTICAL CHAPTER LIST */
    .chapter-section {
      display: flex;
      flex-direction: column;
    }
    .section-label {
      font-size: 11px;
      letter-spacing: 0.1em;
      color: #64748b;
      margin-bottom: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .chapter-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .chapter-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px 12px;
      border-radius: 12px;
      cursor: pointer;
      gap: 12px;
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }
    .chapter-row:hover { background-color: rgba(255, 255, 255, 0.05); }
    .chapter-row.active { 
      background-color: #1e3a5f;
      border-color: rgba(96, 165, 250, 0.3);
    }

    .chapter-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: #1f2937;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .chapter-row.active .chapter-icon {
      background-color: #3b82f6;
      color: #fff;
    }
    .chapter-row.completed .chapter-icon {
      background-color: #059669;
      color: #fff;
    }

    .chapter-name {
      color: #cbd5e1;
      font-size: 14px;
      font-weight: 600;
      flex: 1;
      line-height: 1.4;
    }
    .chapter-row.active .chapter-name {
      color: #fff;
    }

    .chapter-dur {
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
    }

    /* 5. CONTENT AREA */
    .content-area {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .content-title {
      color: #f9fafb;
      font-size: 18px;
      font-weight: 800;
    }
    .content-body {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.7;
    }
    .content-body p { margin-bottom: 16px; }

    /* 6. FIXED BOTTOM BAR */
    .bottom-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 100;
      box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.3);
    }
    
    .btn {
      border-radius: 10px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn:active:not(:disabled) { transform: scale(0.98); }
    .btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .btn-main {
      width: 100%;
      height: 48px;
      background-color: #3b82f6;
      color: #fff;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .btn-main.completed {
      background-color: #059669;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }

    .nav-buttons {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }
    .btn-sec {
      flex: 1;
      height: 38px;
      background: rgba(255, 255, 255, 0.05);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 14px;
      font-weight: 600;
    }

  </style>
</head>
<body>

<div class="wrapper">
  
  <!-- 1. Header -->
  <div class="header-section">
    <div class="badge" id="category-badge">Loading...</div>
    <div class="course-title" id="head-title">Loading Course...</div>
    <div class="course-subtitle" id="head-subtitle">...</div>
  </div>

  <!-- 2. Progress -->
  <div class="progress-section">
    <div class="progress-labels">
      <span class="progress-lbl-left">Your Progress</span>
      <span class="progress-lbl-right" id="prog-text">0 of 0 completed</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="prog-fill"></div>
    </div>
  </div>

  <div class="scrollable-content">
    
    <!-- 3. Video Placeholder (Active Chapter Only) -->
    <div class="video-placeholder" id="video-box" onclick="playVideo()">
      <div class="play-btn"><div class="play-triangle"></div></div>
      <div class="video-text" id="video-tag">Chapter 1 · Video Lesson</div>
      <div class="video-overlay" id="video-overlay">▶ Playing...</div>
    </div>

    <!-- 4. Vertical Chapter List -->
    <div class="chapter-section">
      <div class="section-label">COURSE CONTENT</div>
      <div class="chapter-list" id="chapter-list">
        <!-- Rows injected here -->
      </div>
    </div>

    <!-- 5. Content Area -->
    <div class="content-area">
      <div class="content-title" id="content-title">Select Module</div>
      <div class="content-body" id="content-body">...</div>
    </div>

  </div>

  <!-- 6. FIXED BOTTOM BAR -->
  <div class="bottom-bar">
    <button class="btn btn-main" id="btn-complete" onclick="markComplete()">Mark as Complete ✅</button>
    
    <div class="nav-buttons">
      <button class="btn btn-sec" id="id-prev" onclick="navChapter(-1)">Previous</button>
      <button class="btn btn-sec" id="id-next" onclick="navChapter(1)">Next</button>
    </div>
  </div>
</div>

<script>
  // Core Data parsing
  const courseData = ${safeData};
  let activeId = 0;
  const completedIds = new Set();
  
  // DOM Cache
  const UI = {
    headTitle: document.getElementById('head-title'),
    headSubtitle: document.getElementById('head-subtitle'),
    badge: document.getElementById('category-badge'),
    progText: document.getElementById('prog-text'),
    progFill: document.getElementById('prog-fill'),
    chapList: document.getElementById('chapter-list'),
    contTitle: document.getElementById('content-title'),
    contBody: document.getElementById('content-body'),
    btnComp: document.getElementById('btn-complete'),
    btnPrev: document.getElementById('id-prev'),
    btnNext: document.getElementById('id-next'),
    vidBox: document.getElementById('video-box'),
    vidTag: document.getElementById('video-tag'),
    vidOverlay: document.getElementById('video-overlay')
  };

  function init() {
    UI.headTitle.textContent = courseData.courseTitle;
    UI.badge.textContent = courseData.category;
    UI.headSubtitle.textContent = \`by \${courseData.instructorName}  ·  \${courseData.chapters.length} chapters\`;
    buildList();
    updateProgress();
    selectChapter(0);
  }

  function buildList() {
    UI.chapList.innerHTML = '';
    courseData.chapters.forEach((ch, idx) => {
      const row = document.createElement('div');
      row.className = 'chapter-row';
      row.id = \`row-\${idx}\`;
      row.onclick = () => selectChapter(idx);
      
      row.innerHTML = \`
        <div class="chapter-icon" id="icon-\${idx}">\${idx + 1}</div>
        <div class="chapter-name">\${ch.title}</div>
        <div class="chapter-dur">\${ch.duration || "5 min"}</div>
      \`;
      UI.chapList.appendChild(row);
    });
  }

  function selectChapter(idx) {
    if(idx < 0 || idx >= courseData.chapters.length) return;
    activeId = idx;
    
    // Update Rows CSS
    document.querySelectorAll('.chapter-row').forEach(row => row.classList.remove('active'));
    const activeRow = document.getElementById(\`row-\${idx}\`);
    if(activeRow) {
      activeRow.classList.add('active');
    }

    // Load Content
    const ch = courseData.chapters[idx];
    UI.contTitle.textContent = ch.title;
    
    let htmlContent = ch.content;
    if(!htmlContent.includes('<p>')) htmlContent = \`<p>\${htmlContent}</p>\`;
    UI.contBody.innerHTML = htmlContent;

    // Reset Video Player
    UI.vidBox.classList.remove('playing');
    UI.vidTag.textContent = \`Chapter \${idx + 1} · Video Lesson\`;
    UI.vidOverlay.textContent = \`▶ Playing Chapter \${idx + 1}...\`;

    updateFooter();
  }

  function updateProgress() {
    const total = courseData.chapters.length;
    const comp = completedIds.size;
    const perc = total > 0 ? (comp / total) * 100 : 0;
    
    UI.progText.textContent = \`\${comp} of \${total} completed\`;
    UI.progFill.style.width = \`\${perc}%\`;
  }

  function updateFooter() {
    const isComp = completedIds.has(activeId);
    if(isComp) {
      UI.btnComp.textContent = 'Completed ✓';
      UI.btnComp.classList.add('completed');
      UI.btnComp.disabled = true;
    } else {
      UI.btnComp.textContent = 'Mark as Complete ✅';
      UI.btnComp.classList.remove('completed');
      UI.btnComp.disabled = false;
    }

    UI.btnPrev.disabled = (activeId === 0);
    UI.btnNext.disabled = (activeId === courseData.chapters.length - 1);
  }

  function markComplete() {
    if(completedIds.has(activeId)) return;
    
    completedIds.add(activeId);
    
    // update icon
    const activeRow = document.getElementById(\`row-\${activeId}\`);
    if(activeRow) activeRow.classList.add('completed');
    const activeIcon = document.getElementById(\`icon-\${activeId}\`);
    if(activeIcon) activeIcon.textContent = '✓';

    updateProgress();
    updateFooter();

    // Notify React Native
    const ch = courseData.chapters[activeId];
    if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'CHAPTER_COMPLETE',
        chapterId: ch.id,
        completedCount: completedIds.size,
        totalCount: courseData.chapters.length
      }));
    }
  }

  function navChapter(dir) {
    selectChapter(activeId + dir);
    // gently scroll to top of list if needed or keep static
  }

  function playVideo() {
    UI.vidBox.classList.add('playing');
  }

  init();
</script>

</body>
</html>
  `;
};
