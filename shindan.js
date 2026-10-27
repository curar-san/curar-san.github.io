/* ============================================================
   個人セッションのおすすめ診断（5問）
   <div class="shindan" data-apply="#contact"></div> の中に描画する。
   data-apply … 「申し込む」ボタンのリンク先
   ============================================================ */

(function () {
  "use strict";

  // 4つの軸
  // listen … ただ聴いてほしい / organize … 整理したい
  // compassion … 自分に厳しすぎる / body … からだからゆるめたい
  const QUESTIONS = [
    {
      text: "いまのあなたに、いちばん近いのはどれですか。",
      choices: [
        { label: "とにかく、誰かに話を聴いてほしい", score: { listen: 2 } },
        { label: "頭の中がごちゃごちゃして、整理したい", score: { organize: 2 } },
        { label: "「もっとがんばらなきゃ」と自分を責めてしまう", score: { compassion: 2 } },
        { label: "気持ちより先に、からだが重い・こっている", score: { body: 2 } },
      ],
    },
    {
      text: "からだの調子はどうですか。",
      choices: [
        { label: "肩・首・背中が、いつもガチガチ", score: { body: 2 } },
        { label: "眠りが浅い、疲れがとれない", score: { body: 1, listen: 1 } },
        { label: "からだは、特に気にならない", score: {} },
        { label: "よくわからない", score: {} },
      ],
    },
    {
      text: "気持ちを言葉にするのは、どんな感じですか。",
      choices: [
        { label: "話し出したら、止まらないかもしれない", score: { listen: 2 } },
        { label: "話したいことはあるけど、まとまらない", score: { organize: 2 } },
        { label: "うまく言葉にできない。話すのは少し苦手", score: { body: 2 }, wordless: true },
        { label: "人に話すより、自分の中で考えがち", score: { organize: 1, compassion: 1 } },
      ],
    },
    {
      text: "落ち込んだとき、自分にどんな言葉をかけていますか。",
      choices: [
        { label: "「なんでできないの」と責めてしまう", score: { compassion: 2 } },
        { label: "「大丈夫」と言い聞かせて、がまんする", score: { compassion: 1, listen: 1 } },
        { label: "何も考えられなくなる", score: { body: 1, listen: 1 } },
        { label: "誰かに相談して、考えを整理する", score: { organize: 1 } },
      ],
    },
    {
      text: "受けやすいのは、どちらですか。",
      choices: [
        { label: "オンラインがいい", format: "online" },
        { label: "対面がいい", format: "offline" },
        { label: "どちらでもいい", format: "any" },
      ],
    },
  ];

  const SESSIONS = {
    counseling: {
      name: "カウンセリング・相談",
      meta: ["60分", "オンライン／対面", "5,000円（初回3,000円）"],
    },
    seitai: {
      name: "整体・からだのケア",
      meta: ["60分", "対面のみ", "10,000円"],
    },
  };

  const RESULTS = {
    listen: {
      type: "まず、聴いてほしいタイプ",
      message:
        "ずっとひとりで抱えてきたぶん、話す場所が足りていないのかもしれません。アドバイスはいりません。まずは、思いつくままに話してもらえれば大丈夫です。",
      plan: ["counseling"],
      howto: "当日は「今日はただ聴いてほしい」とひとこと言ってもらえれば、そのようにします。",
    },
    organize: {
      type: "頭の中を、整理したいタイプ",
      message:
        "考えることがたくさんあって、からまっている状態かもしれません。質問をしながら、あなたの中にもう答えがあるものを、一緒にほどいていきます。",
      plan: ["counseling"],
      howto: "まとめてくる必要はありません。ばらばらのまま話してもらえれば、こちらで一緒に整理します。",
    },
    compassion: {
      type: "自分にきびしすぎるタイプ",
      message:
        "がんばれない自分を責めてしまうのは、それだけまじめにやってきた証拠です。企業研修でもお伝えしている「自分にやさしくする練習（セルフコンパッション）」を、マンツーマンで進めることもできます。",
      plan: ["counseling"],
      howto: "「自分にやさしくする練習をしてみたい」と書いてもらえれば、その準備をしておきます。",
    },
    body: {
      type: "からだから、ゆるめたいタイプ",
      message:
        "こころが緊張していると、からだも同じように固まります。言葉にしづらいときは、からだのほうから先にゆるめると、気持ちも少し軽くなることがあります。",
      plan: ["seitai"],
      howto: "話さなくても大丈夫です。からだをゆるめながら、話したくなったら話してください。",
    },
    combo: {
      type: "こころも、からだも固まっているタイプ",
      message:
        "気持ちもからだも、両方がんばりすぎている状態かもしれません。まず話して、いまの状態を一緒に整理してから、からだをゆるめていく順番がおすすめです。",
      plan: ["counseling", "seitai"],
      howto: "どちらを先にするかは、その日のあなたに合わせて変えられます。",
    },
    comboBodyFirst: {
      type: "こころも、からだも固まっているタイプ",
      message:
        "気持ちもからだも、両方がんばりすぎている状態かもしれません。言葉にするのがしんどいときは、からだを先にゆるめると、あとで話しやすくなります。",
      plan: ["seitai", "counseling"],
      howto: "どちらを先にするかは、その日のあなたに合わせて変えられます。",
    },
    bodyOnline: {
      type: "からだから、ゆるめたいタイプ",
      message:
        "からだがかなりがんばっているようです。整体は対面のみなので、まずはオンラインのカウンセリングで、いまのからだの状態も含めてお話を聴かせてください。",
      plan: ["counseling"],
      howto: "対面で受けられるようになったら、整体に切り替えることもできます。",
    },
  };

  // 回答から結果のキーを決める
  function judge(answers) {
    const score = { listen: 0, organize: 0, compassion: 0, body: 0 };
    let format = "any";
    let wordless = false;

    answers.forEach((choice) => {
      Object.entries(choice.score || {}).forEach(([key, value]) => {
        score[key] += value;
      });
      if (choice.format) format = choice.format;
      if (choice.wordless) wordless = true;
    });

    // こころ側でいちばん強い軸（同点なら、聴く → 整理 → セルフコンパッションの順）
    const mindKey = ["listen", "organize", "compassion"].reduce((best, key) =>
      score[key] > score[best] ? key : best
    );
    const mind = score[mindKey];

    if (format === "online") {
      // 整体は対面のみなので、オンライン希望ならカウンセリングに寄せる
      return score.body > mind ? "bodyOnline" : mindKey;
    }
    if (score.body >= 3 && mind >= 3) {
      return wordless ? "comboBodyFirst" : "combo";
    }
    if (score.body > mind) return "body";
    return mindKey;
  }

  // 文字列をHTMLとして安全に入れる
  function escape(text) {
    return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function mount(root) {
    const applyHref = root.dataset.apply || "session.html#contact";
    let answers = [];

    function renderStart() {
      root.innerHTML = `
        <div class="shindan-card">
          <p class="shindan-step">5つの質問・1分ほど</p>
          <h3 class="shindan-q">どのセッションが合いそうか、いっしょに見てみましょう。</h3>
          <p class="shindan-note">正解はありません。いちばん近いと思うものを、深く考えずに選んでください。</p>
          <button type="button" class="btn btn-solid shindan-start">はじめる</button>
        </div>`;
      root.querySelector(".shindan-start").addEventListener("click", () => {
        answers = [];
        renderQuestion(0);
      });
    }

    function renderQuestion(index) {
      const q = QUESTIONS[index];
      const choices = q.choices
        .map(
          (c, i) =>
            `<li><button type="button" class="shindan-choice" data-index="${i}">${escape(c.label)}</button></li>`
        )
        .join("");
      const back = index > 0 ? `<button type="button" class="shindan-back">← ひとつ戻る</button>` : "";

      root.innerHTML = `
        <div class="shindan-card">
          <div class="shindan-progress" aria-hidden="true"><span style="width:${(index / QUESTIONS.length) * 100}%"></span></div>
          <p class="shindan-step">質問 ${index + 1} / ${QUESTIONS.length}</p>
          <h3 class="shindan-q" tabindex="-1">${escape(q.text)}</h3>
          <ul class="shindan-choices">${choices}</ul>
          ${back}
        </div>`;

      root.querySelectorAll(".shindan-choice").forEach((button) => {
        button.addEventListener("click", () => {
          answers[index] = q.choices[Number(button.dataset.index)];
          if (index + 1 < QUESTIONS.length) renderQuestion(index + 1);
          else renderResult();
        });
      });
      const backButton = root.querySelector(".shindan-back");
      if (backButton) backButton.addEventListener("click", () => renderQuestion(index - 1));

      // 2問目以降は、質問文にフォーカスを移して読み上げやすくする
      if (index > 0) root.querySelector(".shindan-q").focus({ preventScroll: true });
    }

    function renderResult() {
      const result = RESULTS[judge(answers)];
      const isCombo = result.plan.length > 1;

      const sessions = result.plan
        .map((key, i) => {
          const s = SESSIONS[key];
          const order = isCombo ? `<span class="shindan-order">${i === 0 ? "まずは" : "そのあと"}</span>` : "";
          const meta = s.meta.map((m) => `<span>${escape(m)}</span>`).join("");
          return `
            <div class="shindan-session">
              ${order}
              <h4>${escape(s.name)}</h4>
              <p class="prog-meta">${meta}</p>
            </div>`;
        })
        .join("");

      const first = SESSIONS[result.plan[0]].name;

      root.innerHTML = `
        <div class="shindan-card shindan-result">
          <p class="shindan-step">あなたは…</p>
          <h3 class="shindan-type" tabindex="-1">${escape(result.type)}</h3>
          <p class="lead-ink">${escape(result.message)}</p>
          <p class="shindan-label">おすすめのセッション</p>
          <div class="shindan-sessions">${sessions}</div>
          <p class="shindan-note">${escape(result.howto)}</p>
          <p class="shindan-note">申し込みフォームの「受けたいセッション」で「${escape(first)}」を選んでください。迷ったら「まだ決めていない」でも大丈夫です。</p>
          <div class="cta-row">
            <a class="btn btn-solid" href="${escape(applyHref)}">このセッションで申し込む</a>
            <button type="button" class="btn btn-line shindan-retry">もう一度やってみる</button>
          </div>
          <p class="shindan-caution">この診断は目安です。医療的な判断ではありません。強い痛みやしびれ、眠れない日が続くときは、先に医療機関を受診してください。</p>
        </div>`;

      root.querySelector(".shindan-retry").addEventListener("click", renderStart);
      root.querySelector(".shindan-type").focus({ preventScroll: true });
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    renderStart();
  }

  document.querySelectorAll(".shindan").forEach(mount);
})();
